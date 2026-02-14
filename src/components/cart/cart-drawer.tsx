'use client';

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function CartDrawer() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, isCartOpen, closeCart } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex flex-col pr-0">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="flex items-center gap-2 font-headline text-2xl">
            Your Cart <span className="text-base font-normal text-muted-foreground">({totalItems} items)</span>
          </SheetTitle>
        </SheetHeader>
        <Separator className="my-4" />
        {totalItems > 0 ? (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="relative h-20 w-20 rounded-md overflow-hidden shrink-0 border">
                      <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="flex-grow">
                      <Link href={`/products/${item.productId}`} onClick={closeCart} className="font-semibold hover:text-primary">{item.name}</Link>
                      {item.size && <p className="text-sm text-muted-foreground">Size: {item.size}</p>}
                      <p className="text-sm font-semibold">৳{item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                        <span className="h-8 w-10 text-center flex items-center justify-center font-medium">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator className="mt-4" />
            <SheetFooter className="bg-muted/50 p-6 sm:flex-col sm:space-x-0 space-y-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>Subtotal</span>
                <span>৳{totalPrice.toFixed(2)}</span>
              </div>
              <Button asChild className="w-full" size="lg" onClick={closeCart}>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
            <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 font-headline text-xl font-bold">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">Add some products to get started.</p>
            <SheetClose asChild>
                <Button asChild className="mt-6" onClick={closeCart}>
                    <Link href="/products">Start Shopping</Link>
                </Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
