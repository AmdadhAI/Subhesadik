'use client';

import { useState, useEffect } from 'react';
import type { SerializedProduct } from '@/types/serialized';
import type { SiteContent } from '@/lib/types';
import { getContent } from '@/lib/firebase-data';
import { Button } from './ui/button';
import Image from 'next/image';

// Inline SVG for WhatsApp icon for better performance and control
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
        <path d="M19.11 4.93A9.92 9.92 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.77.46 3.44 1.28 4.92L2 22l5.25-1.38c1.44.75 3.06 1.18 4.79 1.18h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.66-1.04-5.14-2.9-7.01zm-7.07 15.28c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.32a7.37 7.37 0 0 1-1.19-4.28c0-4.07 3.3-7.37 7.37-7.37s7.37 3.3 7.37 7.37-3.3 7.37-7.37 7.37zm4.26-5.55c-.23-.11-1.36-.67-1.57-.75s-.36-.11-.51.11-.6.75-.73.9s-.26.17-.48.06c-.23-.11-1.36-.5-2.59-1.6c-.96-.86-1.6-1.92-1.78-2.25s-.04-.5.08-.66c.11-.11.23-.28.35-.44s.17-.23.26-.38.04-.28-.02-.38c-.06-.11-.51-1.23-.7-1.68s-.38-.38-.51-.38h-.5c-.17 0-.43.06-.66.31s-.82.8-.82 1.95c0 1.15.84 2.27.96 2.42s1.64 2.5 3.97 3.5c.57.24 1.02.38 1.37.48.57.17 1.07.15 1.47-.08.45-.27 1.34-1.38 1.53-1.84.18-.45.18-.84.12-.95s-.22-.17-.48-.28z"/>
    </svg>
);

// Inline SVG for Messenger icon
const MessengerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
        <path d="M12 2C6.48 2 2 6.04 2 11.5c0 3.01 1.47 5.71 3.78 7.37V22l3.41-2.05c1.1.33 2.29.53 3.52.53 5.52 0 10-4.48 10-10S17.52 2 12 2zm1.24 12.19l-2.2-2.31-4.43 2.31L11.55 9.8l2.2 2.31 4.43-2.31L13.24 14.19z"/>
    </svg>
);

interface ProductQuickContactProps {
    product: SerializedProduct;
}

export function ProductQuickContact({ product }: ProductQuickContactProps) {
    const [content, setContent] = useState<SiteContent | null>(null);
    const [productUrl, setProductUrl] = useState('');

    useEffect(() => {
        async function fetchSiteContent() {
            try {
                const siteContent = await getContent();
                setContent(siteContent);
            } catch (error) {
                console.error("Failed to fetch site content for quick contact:", error);
            }
        }
        fetchSiteContent();
        // Ensure this runs client-side to get the correct URL
        setProductUrl(window.location.href);
    }, []);

    if (!content?.productPageOptions?.showQuickContact) {
        return null;
    }
    
    const { contact } = content;
    const { 
        whatsappNumber, 
        messengerUsername, 
        productChatHelperText, 
        whatsappIconUrl, 
        messengerIconUrl 
    } = contact;

    const whatsappNum = whatsappNumber?.replace(/[^0-9]/g, '');

    const defaultMessage = content.productPageOptions.whatsappInquiryMessage || "Hello, I am interested in this product: {{productName}} - {{productUrl}}";
    const message = defaultMessage
        .replace('{{productName}}', product.name)
        .replace('{{productUrl}}', productUrl);

    const whatsappUrl = whatsappNum ? `https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}` : null;
    const messengerUrl = messengerUsername ? `https://m.me/${messengerUsername}` : null;

    const hasAnyContact = whatsappUrl || messengerUrl;

    if (!hasAnyContact) {
        return null;
    }

    return (
        <div className="space-y-3">
            {productChatHelperText && (
                <p className="text-center text-sm text-muted-foreground">{productChatHelperText}</p>
            )}
            <div className="grid grid-cols-2 gap-2">
                {whatsappUrl && (
                    <Button asChild className="bg-[#25D366] hover:bg-[#25D366]/90 text-white">
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                             {whatsappIconUrl ? (
                                <Image src={whatsappIconUrl} alt="WhatsApp" width={20} height={20} className="mr-2" />
                            ) : (
                                <WhatsAppIcon className="h-5 w-5 mr-2" />
                            )}
                            WhatsApp
                        </a>
                    </Button>
                )}
                {messengerUrl && (
                     <Button asChild className="bg-[#00B2FF] hover:bg-[#00B2FF]/90 text-white">
                        <a href={messengerUrl} target="_blank" rel="noopener noreferrer">
                           {messengerIconUrl ? (
                                <Image src={messengerIconUrl} alt="Messenger" width={20} height={20} className="mr-2" />
                            ) : (
                                <MessengerIcon className="h-5 w-5 mr-2" />
                            )}
                            Messenger
                        </a>
                    </Button>
                )}
            </div>
        </div>
    );
}
