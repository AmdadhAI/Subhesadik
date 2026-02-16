'use client';

import { getContent } from '@/lib/firebase-data';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { SiteContent } from '@/lib/types';
import { Facebook, MessageCircle } from 'lucide-react';

const defaultContent: SiteContent = {
  aboutUs: 'Subhe Sadik is your one-stop shop for high-quality, minimalist products. We believe in "less is more" and strive to bring you items that are both beautiful and functional. Our collection is carefully curated to ensure that every product meets our high standards of quality and design.',
  contact: {
    address: '123 Subhe Sadik Lane, Dhaka, Bangladesh',
    email: 'support@subhesadik.com',
    phone: '+880 123 456 7890',
    messengerUsername: 'subhesadik',
    whatsappNumber: '+8801234567890',
    facebookUrl: 'https://www.facebook.com/subhesadik4747',
  },
  checkoutNotice: 'Please note that shipping times may vary depending on your location. We appreciate your patience!',
  heroImageUrl: 'https://picsum.photos/seed/homepage-hero/1280/400'
};


export function Footer() {
  const [content, setContent] = useState<SiteContent>(defaultContent);

  useEffect(() => {
    async function fetchContent() {
      try {
        const fetchedContent = await getContent();
        // Merge with defaults to preserve any new fields not yet in Firestore
        setContent({
          ...defaultContent,
          ...fetchedContent,
          contact: {
            ...defaultContent.contact,
            ...fetchedContent.contact,
          }
        });
      } catch (error) {
        console.error("Failed to fetch footer content:", error);
      }
    }
    fetchContent();
  }, []);

  const hasSocialMedia = content.contact.facebookUrl || content.contact.messengerUsername || content.contact.whatsappNumber;

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="font-headline font-bold text-lg text-primary">Subhe Sadik</h3>
            <p className="mt-2 text-sm text-muted-foreground">Purity in every thread, Halal in every choice.</p>

            {/* Social Media Icons */}
            {hasSocialMedia && (
              <div className="flex gap-3 mt-4 justify-center md:justify-start">
                {content.contact.facebookUrl && (
                  <a
                    href={content.contact.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary/10 hover:bg-primary hover:text-white text-primary transition-colors p-2.5 rounded-full"
                    aria-label="Visit our Facebook page"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {content.contact.messengerUsername && (
                  <a
                    href={`https://m.me/${content.contact.messengerUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary/10 hover:bg-primary hover:text-white text-primary transition-colors p-2.5 rounded-full"
                    aria-label="Chat with us on Messenger"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>
                )}
                {content.contact.whatsappNumber && (
                  <a
                    href={`https://wa.me/${content.contact.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary/10 hover:bg-primary hover:text-white text-primary transition-colors p-2.5 rounded-full"
                    aria-label="Message us on WhatsApp"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="mt-2 space-y-1">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
              <li><Link href="/cart" className="text-sm text-muted-foreground hover:text-primary">Your Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Contact Us</h4>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <p>{content.contact.address}</p>
              <p>Email: {content.contact.email}</p>
              <p>Phone: {content.contact.phone}</p>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Subhe Sadik. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
