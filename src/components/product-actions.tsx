'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import type { SerializedProduct, ProductVariant } from '@/types/serialized';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingBag, ShoppingCart, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface ProductActionsProps {
  product: SerializedProduct;
  selectedVariant: ProductVariant;
}

export function ProductActions({ product, selectedVariant }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAction = (isBuyNow: boolean) => {
    if (selectedVariant.inStock) {
        // Add item to cart, but don't show the default toast.
        // The dialog or redirect will serve as confirmation.
        addItem(product, selectedVariant, quantity, false);
        
        if (isBuyNow) {
            // For "Buy Now", immediately redirect to checkout.
            router.push('/checkout');
        } else {
            // For "Add to Cart", open the confirmation dialog.
            setIsDialogOpen(true);
        }
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <label htmlFor="quantity" className="font-medium">Quantity:</label>
          <div className="flex items-center border rounded-md w-32">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9" 
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
              className="w-full text-center border-0 focus-visible:ring-0 h-9"
              min="1"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9"
              onClick={() => handleQuantityChange(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => handleAction(false)} disabled={!selectedVariant.inStock} className="w-full sm:w-auto" variant="outline">
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
          <Button onClick={() => handleAction(true)} disabled={!selectedVariant.inStock} className="w-full sm:w-auto">
            <ShoppingBag className="mr-2 h-4 w-4" /> Buy Now
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div className="space-y-2">
                <DialogTitle className="text-xl font-semibold">
                    Product Added to Cart
                </DialogTitle>
                <DialogDescription>
                    You have added <span className="font-bold text-primary">{product.name} {selectedVariant.name ? `(${selectedVariant.name})` : ''}</span> to your shopping cart!
                </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="flex-row justify-center gap-2 pt-4">
            <Button asChild variant="outline">
                <Link href="/cart">View Cart</Link>
            </Button>
            <Button asChild>
                <Link href="/checkout">Confirm Order</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
