'use client';

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCart();

  if (totalItems === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-20 bg-card rounded-lg">
          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
          <h1 className="mt-4 font-headline text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
          <Button asChild className="mt-6">
            <Link href="/">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Your Cart ({totalItems} items)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="relative h-24 w-24 rounded-md overflow-hidden shrink-0">
                      <Image src={item.image} alt={item.name} width={96} height={96} className="object-cover" />
                    </div>
                    <div className="flex-grow">
                      <Link href={`/products/${item.productId}`} className="font-semibold hover:text-primary">{item.name}</Link>
                      {item.variantName && <p className="text-sm text-muted-foreground">Unit: {item.variantName}</p>}
                      <p className="text-sm text-muted-foreground">Price: ৳{item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                        <Input type="number" value={item.quantity} readOnly className="h-8 w-14 text-center" />
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">৳{(item.price * item.quantity).toFixed(2)}</p>
                      <Button variant="ghost" size="icon" className="mt-2 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>৳{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>৳{totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
