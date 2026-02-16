import { Phone } from 'lucide-react';

interface TopBannerProps {
    text: string;
    phone?: string; // WhatsApp phone number (e.g., "8801234567890")
}

/**
 * Server-rendered top banner with fixed height
 * Always renders with reserved space to prevent CLS
 * Content is editable from admin panel
 * Includes clickable WhatsApp phone number
 */
export function TopBanner({ text, phone }: TopBannerProps) {
    // Format phone for WhatsApp (remove spaces, hyphens, etc.)
    const cleanPhone = phone?.replace(/\D/g, '') || '';
    const whatsappLink = cleanPhone ? `https://wa.me/${cleanPhone}` : '';

    // Always render with fixed height to prevent CLS
    // Mobile: 2 lines (min-h-16), Desktop: 1 line (h-10)
    return (
        <div className="w-full bg-primary min-h-10 md:h-10 flex flex-wrap md:flex-nowrap items-center justify-center text-sm font-medium px-4 gap-2 md:gap-4 py-2">
            {text && <span className="line-clamp-2 md:line-clamp-1 text-white text-center">{text}</span>}
            {whatsappLink && (
                <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:underline whitespace-nowrap font-semibold text-white"
                >
                    <Phone className="h-3.5 w-3.5" />
                    {phone}
                </a>
            )}
        </div>
    );
}
