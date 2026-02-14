'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Order, Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, ShoppingCart, Users, Package, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';


function StatCard({ title, value, icon: Icon, isLoading }: { title: string, value: string | number, icon: React.ElementType, isLoading: boolean }) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-1/2" />
                </CardContent>
            </Card>
        )
    }
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}


export default function AdminDashboardPage() {
    const firestore = useFirestore();
    const router = useRouter();

    const ordersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const productsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'products');
    }, [firestore]);
    
    const { data: orders, isLoading: ordersLoading } = useCollection<Order>(ordersQuery);
    const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

    const stats = useMemo(() => {
        if (!orders || !products) return null;

        const totalRevenue = orders
            .filter(o => o.orderStatus === 'Delivered')
            .reduce((sum, o) => sum + (o.totalAmount || (o as any).total || 0), 0);

        const customerMap = new Map();
        orders.forEach(order => {
          if (!customerMap.has(order.mobilePhoneNumber)) {
            customerMap.set(order.mobilePhoneNumber, true);
          }
        });

        return {
            totalRevenue: `৳${totalRevenue.toFixed(2)}`,
            totalOrders: orders.length,
            totalCustomers: customerMap.size,
            totalProducts: products.length,
        };
    }, [orders, products]);
    
    const recentOrders = useMemo(() => orders?.slice(0, 5) || [], [orders]);
    const isLoading = ordersLoading || productsLoading;
    
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
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Revenue" value={stats?.totalRevenue ?? 0} icon={DollarSign} isLoading={isLoading} />
                <StatCard title="Total Orders" value={stats?.totalOrders ?? 0} icon={ShoppingCart} isLoading={isLoading} />
                <StatCard title="Total Customers" value={stats?.totalCustomers ?? 0} icon={Users} isLoading={isLoading} />
                <StatCard title="Total Products" value={stats?.totalProducts ?? 0} icon={Package} isLoading={isLoading} />
            </div>
            
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>A list of the 5 most recent orders.</CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin/orders">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                           {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : recentOrders.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentOrders.map(order => (
                                    <TableRow key={order.id} className="cursor-pointer" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                                        <TableCell>
                                            <div className="font-medium">{order.fullName}</div>
                                            <div className="text-sm text-muted-foreground">{order.mobilePhoneNumber}</div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
                                        <TableCell className="text-right">৳{(order.totalAmount || (order as any).total || 0).toFixed(2)}</TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {order.createdAt instanceof Timestamp ? format(order.createdAt.toDate(), 'dd MMM yyyy') : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-10">
                             <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 font-semibold">No orders yet</h3>
                            <p className="text-sm text-muted-foreground">When new orders are placed, they will appear here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
