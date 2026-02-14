'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OrdersPage() {
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  const getStatusBadge = (status: Order['orderStatus']) => {
    const variants: Record<Order['orderStatus'], { className: string; text: string }> = {
      Pending: { className: 'bg-blue-500', text: 'Pending' },
      Confirmed: { className: 'bg-green-600', text: 'Confirmed' },
      Delivered: { className: 'bg-purple-600', text: 'Delivered' },
      Cancelled: { className: 'bg-red-600', text: 'Cancelled' },
    };
    const variant = variants[status] || { className: 'bg-gray-500', text: 'Unknown' };
    return (
      <Badge className={cn('border-transparent text-white hover:bg-opacity-90', variant.className)}>
        {variant.text}
      </Badge>
    );
  };
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Orders</h1>
      
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : orders && orders.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>A list of all orders placed in your store.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-semibold">{order.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.createdAt instanceof Timestamp ? format(order.createdAt.toDate(), 'dd MMM yyyy, h:mm a') : 'Date not available'}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">{order.id}</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                       <Link href={`/admin/orders/${order.id}`}>View</Link>
                    </Button>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <p className="font-bold text-lg">৳{(order.totalAmount || (order as any).total || 0).toFixed(2)}</p>
                    {getStatusBadge(order.orderStatus)}
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs truncate max-w-[120px]">{order.id}</TableCell>
                      <TableCell>
                        {order.createdAt instanceof Timestamp ? format(order.createdAt.toDate(), 'dd MMM yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>{order.fullName}</TableCell>
                      <TableCell className="text-right">৳{(order.totalAmount || (order as any).total || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(order.orderStatus)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Order</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
            <CardContent className="flex flex-col items-center justify-center text-center py-20">
                <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                <h2 className="mt-4 font-headline text-2xl font-bold">No Orders Found</h2>
                <p className="mt-2 text-muted-foreground">When customers place orders, they will appear here.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
