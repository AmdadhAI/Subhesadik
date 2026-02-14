import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-center items-center py-20">
        <div className="w-full max-w-md text-center p-6 md:p-8 rounded-lg bg-card">
              <div className="mx-auto bg-accent rounded-full h-16 w-16 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h1 className="font-headline text-3xl mt-6 font-bold">Order Placed Successfully!</h1>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                  Thank you for your order. We will contact you shortly to confirm delivery details.
              </p>
              <div className="mt-6 text-sm">
                  <span className="text-muted-foreground">Payment method:</span>
                  <span className="ml-2 font-semibold bg-muted px-2 py-1 rounded-md">Cash on Delivery</span>
              </div>
              <div className="mt-8">
                  <Button asChild size="lg">
                      <Link href="/">Continue Shopping</Link>
                  </Button>
              </div>
        </div>
      </div>
    </div>
  );
}
