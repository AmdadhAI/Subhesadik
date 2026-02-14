'use client';

import { useCart } from '@/hooks/use-cart';
import type { SerializedProduct, ProductVariant } from '@/types/serialized';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface AddToCartButtonProps {
  product: SerializedProduct;
  variant: ProductVariant;
  quantity?: number;
  className?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon" | null;
  children?: React.ReactNode;
}

export default function AddToCartButton({ product, variant, quantity = 1, className, buttonVariant = "default", size, children }: AddToCartButtonProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent link navigation if the button is inside a Link
    if (variant.inStock) {
      addItem(product, variant, quantity);
    }
  };

  return (
    <Button 
      onClick={handleAddToCart} 
      disabled={!variant.inStock} 
      className={className}
      variant={buttonVariant}
      size={size || undefined}
      aria-label={children ? undefined : "Add to cart"}
    >
      {children ? (
          children
      ) : (
        <ShoppingCart />
      )}
    </Button>
  );
}
