'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, User, Phone, Mail, MapPin, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const orderId = params.orderId as string;

  const firestore = useFirestore();
  const orderRef = useMemoFirebase(() => {
    if (!firestore || !orderId) return null;
    return doc(firestore, 'orders', orderId);
  }, [firestore, orderId]);

  const { data: order, isLoading } = useDoc<Order>(orderRef);

  const handleStatusChange = async (newStatus: Order['orderStatus']) => {
    if (!orderRef) return;
    try {
      await updateDoc(orderRef, { orderStatus: newStatus });
      toast({
        title: 'Status Updated',
        description: `Order status changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update order status.',
      });
    }
  };

  const getStatusBadge = (status: Order['orderStatus']) => {
    const variants: Record<Order['orderStatus'], { className: string; text: string }> = {
      Pending: { className: 'bg-blue-500', text: 'Pending' },
      Confirmed: { className: 'bg-green-600', text: 'Confirmed' },
      Delivered: { className: 'bg-purple-600', text: 'Delivered' },
      Cancelled: { className: 'bg-red-600', text: 'Cancelled' },
    };
    const variant = variants[status] || { className: 'bg-gray-500', text: 'Unknown' };
    return (
      <Badge className={cn('border-transparent text-white', variant.className)}>
        {variant.text}
      </Badge>
    );
  };

  if (isLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-32" />
            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Order Not Found</h1>
        <p className="text-muted-foreground">The requested order could not be found.</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const totalAmount = order.totalAmount || (order as any).total || 0;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={() => router.push('/admin/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <p className="text-sm text-muted-foreground font-mono">{order.id}</p>
        </div>
        <div className="flex items-center gap-4">
            {getStatusBadge(order.orderStatus)}
            <Select onValueChange={handleStatusChange} defaultValue={order.orderStatus}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShoppingBag className="h-5 w-5"/>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                    {order.products.map((item, index) => (
                        <div key={index} className="flex justify-between items-start gap-4">
                            <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {item.size && `Size: ${item.size} ・ `}
                                    Qty: {item.quantity} × ৳{item.price.toFixed(2)}
                                </p>
                            </div>
                            <p className="font-semibold text-right">৳{(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>৳{totalAmount.toFixed(2)}</span>
                    </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{order.fullName}</span></div>
                    <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /><span>{order.mobilePhoneNumber}</span></div>
                    {order.email && <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><span>{order.email}</span></div>}
                    <div className="flex items-start gap-3 pt-2"><MapPin className="h-4 w-4 text-muted-foreground mt-1" /><p>{order.address}</p></div>
                     <div className="flex items-start gap-3 pt-2"><p className="font-semibold">{order.shippingZone}</p></div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Order Information</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">{order.createdAt instanceof Timestamp ? format(order.createdAt.toDate(), 'dd MMM yyyy, h:mm a') : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment</span>
                        <span className="font-medium">{order.paymentMethod}</span>
                    </div>
                    {order.orderNotes && (
                        <>
                            <Separator />
                            <div>
                               <p className="text-muted-foreground mb-1">Order Notes</p>
                               <p className="text-sm bg-muted p-3 rounded-md">{order.orderNotes}</p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
