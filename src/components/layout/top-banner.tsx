interface TopBannerProps {
    text: string;
}

/**
 * Server-rendered top banner with fixed height
 * Always renders with reserved space to prevent CLS
 * Content is editable from admin panel
 */
export function TopBanner({ text }: TopBannerProps) {
    // Always render with fixed height to prevent CLS
    // If no text, show empty space (0 CLS!)
    return (
        <div className="w-full bg-primary text-primary-foreground h-10 flex items-center justify-center text-sm font-medium px-4">
            {text && <span className="line-clamp-1">{text}</span>}
        </div>
    );
}
