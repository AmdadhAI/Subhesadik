'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingCart, Phone, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { getContent } from '@/lib/firebase-data';
import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';

const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/products", icon: Store, label: "Shop" },
    { href: "/collections", icon: LayoutGrid, label: "Categories" },
];

function NavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType, label: string }) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
    
    return (
        <Link href={href} className={cn(
            "flex flex-col items-center justify-center gap-1 p-2 rounded-md text-xs w-full h-full",
            isActive ? "text-primary bg-muted" : "text-muted-foreground hover:bg-muted hover:text-primary"
        )}>
            <Icon className="h-5 w-5" />
            <span className="font-medium">{label}</span>
        </Link>
    )
}

// Inline SVG for WhatsApp icon
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

type ContactInfo = {
    phone: string;
    whatsapp: string;
    messenger: string;
    whatsappIconUrl?: string;
    messengerIconUrl?: string;
}

export function BottomNav() {
    const pathname = usePathname();
    const { openCart, totalItems } = useCart();
    const [contactInfo, setContactInfo] = useState<ContactInfo>({ phone: '', whatsapp: '', messenger: '' });
    const [isContactPopoverOpen, setContactPopoverOpen] = useState(false);

    useEffect(() => {
        if (isContactPopoverOpen) {
            const timer = setTimeout(() => {
                setContactPopoverOpen(false);
            }, 5000); // 5-second delay
            return () => clearTimeout(timer);
        }
    }, [isContactPopoverOpen]);

    useEffect(() => {
        async function fetchContact() {
            const content = await getContent();
            const phone = content?.contact?.phone?.replace(/[^0-9+]/g, '') || '';
            const whatsapp = content?.contact?.whatsappNumber?.replace(/[^0-9+]/g, '') || phone;
            const messenger = content?.contact?.messengerUsername || '';
            setContactInfo({ 
                phone, 
                whatsapp, 
                messenger,
                whatsappIconUrl: content.contact.whatsappIconUrl,
                messengerIconUrl: content.contact.messengerIconUrl
            });
        }
        fetchContact();
    }, []);
    
    // Don't render on server, and don't render on admin pages.
    const [isClient, setIsClient] = useState(false);
    useEffect(() => setIsClient(true), []);
    if (!isClient || pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
            <nav className="grid grid-cols-5 items-center justify-center gap-1 p-1">
                {navItems.map(item => (
                    <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
                ))}

                <div onClick={openCart} className={cn(
                    "relative flex flex-col items-center justify-center gap-1 p-2 rounded-md text-xs w-full h-full text-muted-foreground hover:bg-muted hover:text-primary cursor-pointer"
                )}>
                    <ShoppingCart className="h-5 w-5" />
                    {isClient && totalItems > 0 && (
                        <span className="absolute top-1 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-1 text-xs font-bold text-primary-foreground">
                            {totalItems}
                        </span>
                    )}
                    <span className="font-medium">Cart</span>
                </div>
                
                <Popover open={isContactPopoverOpen} onOpenChange={setContactPopoverOpen}>
                    <PopoverTrigger asChild>
                         <div className={cn(
                            "flex flex-col items-center justify-center gap-1 p-2 rounded-md text-xs w-full h-full text-muted-foreground hover:bg-muted hover:text-primary cursor-pointer"
                        )}>
                            <Phone className="h-5 w-5" />
                            <span className="font-medium">Contact</span>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="center" className="bg-transparent border-none shadow-none p-0 w-auto" sideOffset={10}>
                        <div className="flex flex-col items-center justify-center gap-4">
                            {contactInfo.phone && (
                                <Button asChild className="h-14 w-14 rounded-full p-0 bg-blue-500 hover:bg-blue-600">
                                    <a href={`tel:${contactInfo.phone}`} aria-label="Call Us">
                                        <Phone className="h-8 w-8 text-white" />
                                    </a>
                                </Button>
                            )}
                            {contactInfo.whatsapp && (
                                 <Button asChild className="h-14 w-14 rounded-full p-0 bg-[#25D366] hover:bg-[#25D366]/90 flex items-center justify-center">
                                    <a href={`https://wa.me/${contactInfo.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
                                        {contactInfo.whatsappIconUrl ? (
                                            <Image src={contactInfo.whatsappIconUrl} alt="WhatsApp" width={36} height={36} />
                                        ) : (
                                            <WhatsAppIcon className="h-9 w-9 text-white" />
                                        )}
                                    </a>
                                </Button>
                            )}
                             {contactInfo.messenger && (
                                 <Button asChild className="h-14 w-14 rounded-full p-0 bg-[#00B2FF] hover:bg-[#00B2FF]/90 flex items-center justify-center">
                                    <a href={`https://m.me/${contactInfo.messenger}`} target="_blank" rel="noopener noreferrer" aria-label="Message on Messenger">
                                       {contactInfo.messengerIconUrl ? (
                                            <Image src={contactInfo.messengerIconUrl} alt="Messenger" width={36} height={36} />
                                        ) : (
                                            <MessengerIcon className="h-9 w-9 text-white" />
                                        )}
                                    </a>
                                </Button>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </nav>
        </div>
    );
}
