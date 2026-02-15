import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();

export const onNewOrder = functions.firestore
    .document("orders/{orderId}")
    .onCreate(
        async (
            snap: functions.firestore.QueryDocumentSnapshot,
            context: functions.EventContext
        ) => {

            // Environment variables
            const gmailEmail = process.env.GMAIL_EMAIL;
            const gmailPassword = process.env.GMAIL_PASSWORD;

            // Safety check (Phase One compliant)
            if (!gmailEmail || !gmailPassword) {
                functions.logger.error(
                    "CRITICAL: Gmail credentials (GMAIL_EMAIL or GMAIL_PASSWORD) are not set. Email will not be sent."
                );
                return null;
            }

            // Transporter (unchanged logic)
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: gmailEmail,
                    pass: gmailPassword,
                },
            });

            const order = snap.data();
            const orderId = context.params.orderId;

            // Defensive check for malformed data to prevent function crashes.
            if (
                !order ||
                !order.products ||
                !Array.isArray(order.products) ||
                order.products.length === 0 ||
                !order.fullName ||
                typeof order.totalAmount !== "number" ||
                typeof order.subtotal !== "number" ||
                typeof order.deliveryCharge !== "number"
            ) {
                functions.logger.error(`Malformed order document received: ${orderId}. Aborting function.`);
                return null;
            }

            // Phase Two Fix: Rate limiting check to prevent email spam and cost abuse
            // CRITICAL: Must use Firestore Timestamp, NOT JavaScript Date for comparison
            const fiveMinutesAgo = admin.firestore.Timestamp.fromMillis(Date.now() - 5 * 60 * 1000);
            try {
                const recentOrders = await admin.firestore()
                    .collection('orders')
                    .where('mobilePhoneNumber', '==', order.mobilePhoneNumber)
                    .where('createdAt', '>', fiveMinutesAgo)
                    .get();

                // Log for debugging (includes current order in count)
                functions.logger.info(`Rate limit check for ${order.mobilePhoneNumber}: ${recentOrders.size} orders in last 5 minutes`);

                // Current order is INCLUDED in query results (it's already written)
                // So check >= 4 (current + 3 previous = rate limit)
                if (recentOrders.size >= 4) {
                    // Rate limit hit: mark as suspicious, skip email, but allow order to exist
                    functions.logger.warn(`🚨 RATE LIMIT HIT for phone ${order.mobilePhoneNumber}. Order count: ${recentOrders.size} in 5 minutes.`);
                    await snap.ref.update({
                        suspicious: true,
                        emailSent: false,
                        rateLimitedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                    return null;
                }
            } catch (error) {
                // Don't block order processing if rate limit check fails - log and continue
                functions.logger.error(`Rate limit check failed for ${orderId}:`, error);
            }

            const orderDate = order.createdAt.toDate();
            const formattedDate = orderDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });

            const productsHtml = order.products
                .map(
                    (p: { name: string; quantity: number; price: number; size?: string }) =>
                        `<tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1F2933; font-size: 14px;">${p.name}${p.size ? ` (${p.size})` : ""}</td>
            <td align="center" style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1F2933; font-size: 14px;">${p.quantity}</td>
            <td align="right" style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1F2933; font-size: 14px;">৳${p.price.toFixed(2)}</td>
            <td align="right" style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1F2933; font-size: 14px;">৳${(p.quantity * p.price).toFixed(2)}</td>
          </tr>`
                )
                .join("");

            let whatsappNumber = order.mobilePhoneNumber.replace(/[^0-9]/g, "");
            if (whatsappNumber.startsWith('01')) {
                whatsappNumber = '880' + whatsappNumber.substring(1);
            }
            const baseUrl = process.env.APP_BASE_URL || 'https://subhesadik-408f5.web.app';
            const adminOrderUrl = `${baseUrl}/admin/orders/${orderId}`;


            const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>New Order Received</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-collapse: collapse; border-radius: 8px; border: 1px solid #e5e7eb;">
            <!-- Header -->
            <tr>
                <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="font-size: 24px; font-weight: bold; color: #1F2933;">Subhe Sadik</td>
                            <td align="right" style="font-size: 16px; color: #6B7280;">New Order Received</td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- Order Meta -->
            <tr>
                <td style="padding: 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="padding-bottom: 10px; font-size: 14px;"><strong style="color: #1F2933;">Order ID:</strong> #${orderId}</td>
                            <td align="right" style="padding-bottom: 10px; font-size: 14px;"><strong style="color: #1F2933;">Date:</strong> ${formattedDate}</td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- Customer Info -->
            <tr>
                <td style="padding: 0 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr><td style="font-size: 18px; font-weight: bold; color: #1F2933; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 10px;">Customer Information</td></tr>
                        <tr><td style="height: 10px;"></td></tr>
                        <tr><td style="padding: 5px 0; font-size: 14px;"><strong style="color: #1F2933;">Name:</strong> ${order.fullName}</td></tr>
                        <tr><td style="padding: 5px 0; font-size: 14px;"><strong style="color: #1F2933;">Phone:</strong> <a href="tel:${order.mobilePhoneNumber}" style="color: #1F7A4D; text-decoration: none;">${order.mobilePhoneNumber}</a></td></tr>
                        ${order.address ? `<tr><td style="padding: 5px 0; font-size: 14px;"><strong style="color: #1F2933;">Address:</strong> ${order.address}</td></tr>` : ""}
                        ${order.orderNotes ? `<tr><td style="padding: 5px 0; font-size: 14px;"><strong style="color: #1F2933;">Notes:</strong> ${order.orderNotes}</td></tr>` : ""}
                    </table>
                </td>
            </tr>
            
            <tr><td style="height: 20px;"></td></tr>

            <!-- Order Items -->
            <tr>
                <td style="padding: 0 20px;">
                     <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f9fafb;">
                                <th align="left" style="padding: 12px; font-size: 14px; color: #1F2933; border-bottom: 1px solid #e5e7eb; border-top: 1px solid #e5e7eb;">Product</th>
                                <th align="center" style="padding: 12px; font-size: 14px; color: #1F2933; border-bottom: 1px solid #e5e7eb; border-top: 1px solid #e5e7eb;">Qty</th>
                                <th align="right" style="padding: 12px; font-size: 14px; color: #1F2933; border-bottom: 1px solid #e5e7eb; border-top: 1px solid #e5e7eb;">Price</th>
                                <th align="right" style="padding: 12px; font-size: 14px; color: #1F2933; border-bottom: 1px solid #e5e7eb; border-top: 1px solid #e5e7eb;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productsHtml}
                        </tbody>
                    </table>
                </td>
            </tr>

            <!-- Order Summary -->
            <tr>
                <td style="padding: 20px 20px 0 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td align="right" style="padding: 5px; color: #6B7280; font-size: 14px;">Subtotal:</td>
                            <td align="right" style="padding: 5px; color: #1F2933; font-size: 14px; width: 120px;">৳${order.subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td align="right" style="padding: 5px; color: #6B7280; font-size: 14px;">Delivery Charge:</td>
                            <td align="right" style="padding: 5px; color: #1F2933; font-size: 14px; width: 120px;">৳${order.deliveryCharge.toFixed(2)}</td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 20px 20px 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                         <tr style="font-weight: bold; font-size: 18px;">
                            <td align="right" style="padding: 10px 5px; color: #1F2933; border-top: 2px solid #e5e7eb;">Total:</td>
                            <td align="right" style="padding: 10px 5px; color: #1F2933; border-top: 2px solid #e5e7eb; width: 120px;">৳${order.totalAmount.toFixed(2)}</td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- Quick Actions -->
            <tr>
                <td style="padding: 20px; border-top: 1px solid #e5e7eb; background-color: #f9fafb; text-align: center;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td align="center" style="padding: 5px;">
                                <a href="tel:${order.mobilePhoneNumber}" style="background-color: #3b82f6; color: white; padding: 12px 18px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 14px;">📞 Call Customer</a>
                            </td>
                            <td align="center" style="padding: 5px;">
                                <a href="https://wa.me/${whatsappNumber}" style="background-color: #25D366; color: white; padding: 12px 18px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 14px;">💬 WhatsApp</a>
                            </td>
                            <td align="center" style="padding: 5px;">
                                <a href="${adminOrderUrl}" style="background-color: #6B7280; color: white; padding: 12px 18px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 14px;">🧾 View in Admin</a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
                    This is an automated notification from Subhe Sadik.
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;


            try {
                const adminEmail = process.env.ADMIN_EMAIL || "try.amdad@gmail.com";
                await transporter.sendMail({
                    from: `"Subhe Sadik" <${gmailEmail}>`,
                    to: adminEmail,
                    subject: `New Order #${orderId}`,
                    html: emailHtml,
                });
                functions.logger.info(`Email sent for order ${orderId}`);

                // Phase Three: Track email success for observability
                await snap.ref.update({
                    emailSent: true,
                    emailSentAt: admin.firestore.FieldValue.serverTimestamp()
                });

            } catch (error) {
                functions.logger.error(`CRITICAL: Email failed for order ${orderId}`, error);

                // Phase Three: Track email failure for manual review/retry
                await snap.ref.update({
                    emailSent: false,
                    emailError: (error as Error).message,
                    emailFailedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }

            return null;
        });

/**
 * Cloud Function: Process hero images into 3 responsive sizes
 * Triggered when image uploaded to hero-uploads/ folder  
 * Generates: 640px (mobile), 1024px (tablet), 1920px (desktop)
 */
import sharp from 'sharp';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

const RESPONSIVE_SIZES = {
    sm: 640,   // Mobile
    md: 1024,  // Tablet
    lg: 1920   // Desktop
};

export const processHeroImage = functions
    .runWith({ memory: '1GB', timeoutSeconds: 540 })
    .storage.object()
    .onFinalize(async (object) => {
        const filePath = object.name;
        
        // Only process hero uploads
        if (!filePath || !filePath.startsWith('hero-uploads/')) {
            return null;
        }

        const bucket = admin.storage().bucket(object.bucket);
        const fileName = path.basename(filePath);
        const imageId = Date.now().toString();
        
        // Download original to temp directory
        const tempFilePath = path.join(os.tmpdir(), fileName);
        await bucket.file(filePath).download({ destination: tempFilePath });

        try {
            functions.logger.info(`Processing hero image: ${fileName} into 3 sizes`);

            // Generate 3 responsive sizes
            const uploadPromises = Object.entries(RESPONSIVE_SIZES).map(async ([sizeName, width]) => {
                const buffer = await sharp(tempFilePath)
                    .resize(width, null, {
                        withoutEnlargement: true,
                        fit: 'inside'
                    })
                    .webp({ quality: 82 })
                    .toBuffer();

                const destFileName = `hero-${sizeName}.webp`;
                const destPath = `hero/${imageId}/${destFileName}`;
                
                await bucket.file(destPath).save(buffer, {
                    metadata: {
                        contentType: 'image/webp',
                        metadata: {
                            originalName: fileName,
                            size: sizeName,
                            width: width.toString()
                        }
                    }
                });

                // Make file publicly readable
                await bucket.file(destPath).makePublic();

                // Get public URL
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destPath}`;
                
                functions.logger.info(`Generated ${sizeName}: ${publicUrl}`);
                
                return { sizeName, url: publicUrl };
            });

            const results = await Promise.all(uploadPromises);

            // Build URLs object
            const urls: { [key: string]: string } = {};
            results.forEach(({ sizeName, url }) => {
                urls[sizeName] = url;
            });

            // Update Firestore with responsive URLs
            await admin.firestore().collection('content').doc('static').update({
                heroImageUrls: {
                    sm: urls.sm,
                    md: urls.md,
                    lg: urls.lg,
                    uploadedAt: admin.firestore.FieldValue.serverTimestamp()
                }
            });

            functions.logger.info(`Successfully processed hero image into 3 sizes: ${imageId}`);

            // Delete original upload file
            await bucket.file(filePath).delete();
            
            // Clean up temp file
            fs.unlinkSync(tempFilePath);

            return { success: true, imageId, urls };

        } catch (error) {
            functions.logger.error('Error processing hero image:', error);
            // Clean up temp file on error
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
            throw error;
        }
    });
