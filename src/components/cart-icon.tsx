'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function CartIcon() {
  const { totalItems, openCart } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Button onClick={openCart} variant="ghost" size="icon" className="relative">
      <ShoppingCart className="h-6 w-6" />
      {isClient && totalItems > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-foreground transform translate-x-1/2 -translate-y-1/2 bg-primary rounded-full">
          {totalItems}
        </span>
      )}
      <span className="sr-only">View shopping cart</span>
    </Button>
  );
}
