'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Mail, Phone, MapPin } from 'lucide-react';

// Define a simple customer type for this page
interface Customer {
  id: string; // Using phone number as a unique ID
  fullName: string;
  mobilePhoneNumber: string;
  email?: string;
  address: string;
  shippingZone: string;
}

export default function CustomersPage() {
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  const customers = useMemo(() => {
    if (!orders) return [];
    
    const customerMap = new Map<string, Customer>();

    orders.forEach(order => {
      if (!customerMap.has(order.mobilePhoneNumber)) {
        customerMap.set(order.mobilePhoneNumber, {
          id: order.mobilePhoneNumber,
          fullName: order.fullName,
          mobilePhoneNumber: order.mobilePhoneNumber,
          email: order.email,
          address: order.address,
          shippingZone: order.shippingZone,
        });
      }
    });

    return Array.from(customerMap.values());
  }, [orders]);
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Customers</h1>
      
      <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
            <CardDescription>A list of all unique customers derived from your orders.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : customers && customers.length > 0 ? (
            <>
              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {customers.map((customer) => (
                  <Card key={customer.id} className="p-4">
                    <p className="font-semibold">{customer.fullName}</p>
                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
                        <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {customer.mobilePhoneNumber}</div>
                        {customer.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {customer.email}</div>}
                        <div className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5" /> {customer.address}, {customer.shippingZone}</div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.fullName}</TableCell>
                        <TableCell>{customer.mobilePhoneNumber}</TableCell>
                        <TableCell>{customer.email || 'N/A'}</TableCell>
                        <TableCell>{customer.address}, {customer.shippingZone}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-20">
                    <Users className="h-16 w-16 text-muted-foreground" />
                    <h2 className="mt-4 font-headline text-2xl font-bold">No Customers Found</h2>
                    <p className="mt-2 text-muted-foreground">When customers place orders, they will appear here.</p>
                </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
