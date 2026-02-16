'use client';

import { getContent } from '@/lib/firebase-data';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { SiteContent } from '@/lib/types';

const defaultContent: SiteContent = {
  aboutUs: 'Subhe Sadik is your one-stop shop for high-quality, minimalist products. We believe in "less is more" and strive to bring you items that are both beautiful and functional. Our collection is carefully curated to ensure that every product meets our high standards of quality and design.',
  contact: {
    address: '123 Subhe Sadik Lane, Dhaka, Bangladesh',
    email: 'support@subhesadik.com',
    phone: '+880 123 456 7890',
    messengerUsername: 'subhesadik',
    whatsappNumber: '+8801234567890',
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
        setContent(fetchedContent);
      } catch (error) {
        console.error("Failed to fetch footer content:", error);
      }
    }
    fetchContent();
  }, []);

  return (
    <footer className="bg-card border-t min-h-[400px]">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="font-headline font-bold text-lg text-primary">Subhe Sadik</h3>
            <p className="mt-2 text-sm text-muted-foreground">Minimalist design, maximum satisfaction.</p>
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
