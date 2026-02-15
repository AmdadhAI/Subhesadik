'use client';

import Link from 'next/link';
import { useMemo, useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Search as SearchIcon, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { AdminHeaderLink } from './admin-header-link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Category } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { HeaderSearch } from '../header-search';
import { CartIcon } from '../cart-icon';
import Image from 'next/image';


export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const firestore = useFirestore();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const categoriesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'categories'),
      where('isActive', '==', true)
    );
  }, [firestore]);

  const { data: unsortedCategories, isLoading } = useCollection<Category>(categoriesQuery);

  const categories = useMemo(() => {
    if (!unsortedCategories) return null;
    return [...unsortedCategories].sort((a, b) => a.order - b.order);
  }, [unsortedCategories]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileSearchOpen) {
        setIsMobileSearchOpen(false);
      }
    };

    // Removing the 'mousedown' listener for handleClickOutside as it can conflict.
    // Users can close with the 'X' button or Escape key.
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileSearchOpen]);

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleMobileSearch = () => setIsMobileSearchOpen(prev => !prev);

  // This component now accepts an onLinkClick prop to handle closing the mobile menu.
  const DesktopNavLinks = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <>
      <Link href="/" className="text-muted-foreground transition-colors hover:text-primary whitespace-nowrap" onClick={onLinkClick}>Home</Link>
      {isLoading ? (
        <div className="flex items-center gap-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ) : (
        categories?.slice(0, 8).map((category) => ( // Limit to avoid clutter
          <Link key={category.id} href={`/collections/${category.slug}`} className="text-muted-foreground transition-colors hover:text-primary whitespace-nowrap" onClick={onLinkClick}>
            {category.name}
          </Link>
        ))
      )}
      <Link href="/products" className="text-muted-foreground transition-colors hover:text-primary whitespace-nowrap" onClick={onLinkClick}>All Products</Link>
      <Link href="/collections" className="text-muted-foreground transition-colors hover:text-primary whitespace-nowrap" onClick={onLinkClick}>All Categories</Link>
      <AdminHeaderLink className="whitespace-nowrap" onClick={onLinkClick} />
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* --- LEFT (Hamburger on mobile, Logo on desktop) --- */}
        <div className="flex items-center gap-4 lg:flex-none">
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-7 w-7" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-3/4 sm:max-w-sm p-0">
                <SheetHeader>
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-6 p-6">
                  <Link href="/" className="font-headline text-xl font-bold text-primary" onClick={handleMobileLinkClick}>
                    Subhe Sadik
                  </Link>
                  <nav className="flex flex-col space-y-2">
                    <DesktopNavLinks onLinkClick={handleMobileLinkClick} />
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="hidden lg:block">
            <Link href="/">
              <div className="relative" style={{ height: '40px', width: '140px' }}>
                <Image src="/logo.webp" alt="Subhe Sadik Logo" fill style={{ objectFit: 'contain' }} priority sizes="140px" />
              </div>
            </Link>
          </div>
        </div>

        {/* --- CENTER (Logo on Mobile, Search on Desktop) --- */}
        <div className="lg:hidden">
          <Link href="/">
            <div className="relative" style={{ height: '40px', width: '140px' }}>
              <Image src="/logo.webp" alt="Subhe Sadik Logo" fill style={{ objectFit: 'contain' }} priority sizes="140px" />
            </div>
          </Link>
        </div>
        <div className="hidden lg:flex flex-1 justify-center px-8">
          <div className="w-full max-w-lg">
            <HeaderSearch setSearching={() => { }} autoFocus={false} />
          </div>
        </div>

        {/* --- RIGHT (Search on Mobile, Cart on Desktop) --- */}
        <div className="flex items-center gap-0.5">
          <Button onClick={toggleMobileSearch} variant="ghost" size="icon" className="lg:hidden">
            {isMobileSearchOpen ? <X className="h-7 w-7" /> : <SearchIcon className="h-7 w-7" />}
            <span className="sr-only">{isMobileSearchOpen ? 'Close search' : 'Open search'}</span>
          </Button>
          <div className="hidden lg:flex">
            <CartIcon />
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div ref={searchContainerRef} className="lg:hidden absolute top-full left-0 w-full bg-card border-b p-4 z-50">
          <HeaderSearch setSearching={setIsMobileSearchOpen} autoFocus={true} />
        </div>
      )}

      {/* Bottom Layer: Desktop Navigation */}
      <nav className="hidden lg:flex container mx-auto h-12 items-center justify-center gap-6 text-sm font-medium border-t">
        <DesktopNavLinks />
      </nav>
    </header>
  );
}
