# **App Name**: SubheSadhik eCommerce

## Core Features:

- Product Browsing by Category: Users can browse products by category. Each category displays a list of products belonging to it. Categories are dynamic and manageable from the admin panel. Categories can be enabled/disabled and reordered.
- Product Details: Each product page includes multiple product images, an optional video URL, the product name, short key features (bullet points), a detailed description, the current price, an optional discounted price (old price crossed out), stock availability (In Stock / Out of Stock), a quantity selector, and Add to Cart and Buy Now buttons.
- Add to Cart Functionality: Users can add multiple products to the cart, which is stored only in browser localStorage. Users can increase/decrease quantity and remove items from cart. A confirmation modal appears after adding a product to cart, displaying the product name, quantity, total price, and View Cart / Checkout buttons. The cart is cleared automatically after successful order placement.
- Guest Checkout Process: Checkout is available without user login or account creation. No OTP, no registration, no customer dashboard.
- Customer Information Collection: During checkout, collect the following required information: Full Name, Mobile Phone Number, Detailed Address (free-text textarea), and Division (dropdown). Optional information includes Email address and Order notes / comments.
- Payment Process: Cash on Delivery (COD) only. No online payment gateway, no payment redirection. Order confirmation is done manually by admin via phone or WhatsApp.
- Order Management: Orders are saved in Firebase Firestore. Each order includes customer information, ordered products, quantity & total amount, payment method (COD), and order status (New, Confirmed, Cancelled).
- Admin Panel: Admin panel is basic and minimal, accessible only via Firebase Authentication. Admin can manage categories (add, edit name, enable/disable), products (add, edit details, upload images/video URL, set price/discount, toggle stock/visibility), and orders (view list, view details, update order status only).
- Content Management: Admin can edit the following from the admin panel: About Us text, Contact information (phone, email, address), and Checkout notice / warning text.

## Style Guidelines:

- Primary color: Deep Indigo #4B0082 (trust & professionalism)
- Background color: Light Lavender #E6E6FA
- Accent color: Violet #8F00FF
- Font (body & headings): PT Sans
- Code font: Source Code Pro (if needed)
- Simple, clean icons
- Subtle animations for interactions (e.g., add to cart feedback)
- Minimal UI, no heavy effects