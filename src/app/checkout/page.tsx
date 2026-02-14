'use client';
// SECURITY-NOTE: For production, consider adding Google reCAPTCHA or Firebase App Check to this form to prevent spam and abuse.

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SHIPPING_ZONES } from '@/lib/firebase-data';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { placeOrder } from '../actions';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { CustomerInfo } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Banknote, CheckCircle, MapPin } from 'lucide-react';
import { cn, slugify } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';


const checkoutSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  mobile: z.string().min(10, { message: "A valid mobile number is required" }),
  address: z.string().min(10, { message: "Full delivery address is required" }),
  shippingZone: z.enum(['Inside Dhaka', 'Outside Dhaka'], {
    required_error: "You need to select a shipping zone.",
  }),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal('')),
  notes: z.string().optional(),
});


export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      mobile: '',
      address: '',
      email: '',
      notes: '',
    },
  });

  const selectedZone = form.watch('shippingZone');
  const deliveryCharge = selectedZone ? SHIPPING_ZONES[selectedZone] : 0;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only redirect if on client, cart is empty, and an order has not just been placed.
    if (isClient && items.length === 0 && !orderPlaced) {
      router.push('/cart');
    }
  }, [isClient, items.length, orderPlaced, router]);


  async function onSubmit(values: z.infer<typeof checkoutSchema>) {
    try {
        const customerData: CustomerInfo = {
            fullName: values.fullName,
            mobile: values.mobile,
            address: values.address,
            shippingZone: values.shippingZone,
            email: values.email,
            notes: values.notes,
        };
        
        setOrderPlaced(true); // Set flag before async operation
        const result = await placeOrder(customerData, items, deliveryCharge);
        
        if (result.success && result.id) {
            clearCart();
            router.push(`/order-confirmation`);
        } else {
            setOrderPlaced(false); // Reset flag on failure
            form.setError('root', { type: 'custom', message: result.error || 'Failed to place order. Please try again.' });
        }
    } catch (error) {
        setOrderPlaced(false); // Reset flag on failure
        form.setError('root', { type: 'custom', message: 'An unexpected error occurred.' });
    }
  }

  // Prevent rendering the page if cart is empty and order isn't placed
  if (!isClient || (items.length === 0 && !orderPlaced)) {
    return null; // or a loading spinner
  }
  
  const displayTotal = totalPrice + deliveryCharge;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 font-headline">Billing details</h1>
      <div className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem>
                  <FormLabel>নাম <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input placeholder="আপনার পুরো নাম লিখুন" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="mobile" render={({ field }) => (
                <FormItem>
                  <FormLabel>মোবাইল নাম্বার <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input placeholder="আপনার মোবাইল নাম্বার দিন" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Address <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Textarea placeholder="Enter your full delivery address" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField
                control={form.control}
                name="shippingZone"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Shipping Zone <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {(Object.keys(SHIPPING_ZONES) as Array<keyof typeof SHIPPING_ZONES>).map((zone) => {
                          const zoneId = `${field.name}-${slugify(zone)}`;
                          return (
                            <FormItem key={zone}>
                                <Label
                                  htmlFor={zoneId}
                                  className={cn(
                                      "relative flex flex-col items-center justify-between rounded-lg border-2 border-input bg-transparent p-4 cursor-pointer transition-all duration-200 hover:bg-accent/50",
                                      field.value === zone && "border-primary bg-primary/5"
                                  )}
                                >
                                    <FormControl>
                                      <RadioGroupItem value={zone} id={zoneId} className="sr-only" />
                                    </FormControl>
                                    {field.value === zone && (
                                        <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-primary" />
                                    )}
                                    <MapPin className="mb-3 h-6 w-6" />
                                    {zone}
                                    <span className="font-bold text-lg mt-1">৳{SHIPPING_ZONES[zone]}</span>
                                </Label>
                            </FormItem>
                          );
                        })}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Notes (optional)</FormLabel>
                  <FormControl><Textarea placeholder="অর্ডার কিংবা ডেলিভারি রিলেটেড কোনো নোটস থাকলে এখানে দিন" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
               {form.formState.errors.root && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
              )}
            </form>
          </Form>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Your order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between font-semibold border-b pb-2">
                  <span>Product</span>
                  <span>Subtotal</span>
              </div>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <p>{item.name} {item.size ? `(${item.size})` : ''} × {item.quantity}</p>
                    <p className="font-medium">৳{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <Separator />
               <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-semibold">৳{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery</span>
                <span className="font-semibold">৳{deliveryCharge.toFixed(2)}</span>
              </div>
              <Separator />
               <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>৳{displayTotal.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start space-y-4 bg-muted/50 p-6">
                <div className="w-full">
                    <h3 className="flex items-center gap-3 text-lg font-semibold mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Banknote className="h-5 w-5 text-primary" />
                        </div>
                        Payment Method
                    </h3>
                    <div className="cursor-pointer rounded-lg border-2 border-primary bg-primary/5 p-4 transition-all">
                        <div className="flex items-center gap-4">
                            <Banknote className="h-8 w-8 text-primary" />
                            <div>
                                <p className="font-semibold text-base">Cash on Delivery</p>
                                <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="pt-4 text-xs text-muted-foreground">
                    Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
                </p>
                <Button 
                    onClick={form.handleSubmit(onSubmit)} 
                    className="w-full" 
                    size="lg"
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? 'Placing Order...' : 'Place Order'}
                </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
