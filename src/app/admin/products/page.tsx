'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Query, doc, deleteDoc } from 'firebase/firestore';
import type { Product, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Pen, Trash2, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeleteDialog } from '@/components/admin/delete-dialog';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AdminProductsPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categoriesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'categories'), orderBy('order', 'asc'));
  }, [firestore]);
  const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesQuery);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let q: Query = collection(firestore, 'products');
    if (categoryFilter !== 'all') {
      q = query(q, where('categorySlug', '==', categoryFilter));
    }
    return query(q, orderBy('createdAt', 'desc'));
  }, [firestore, categoryFilter]);

  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };
  
  const performDelete = async () => {
      if (!selectedProduct || !firestore) return;
      try {
          await deleteDoc(doc(firestore, 'products', selectedProduct.id));
          toast({ title: 'Success', description: 'Product deleted.' });
          router.refresh();
      } catch (e: any) {
          toast({ variant: 'destructive', title: 'Error', description: e.message });
      }
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
  }

  const isLoading = categoriesLoading || productsLoading;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-2">
            <Select onValueChange={setCategoryFilter} value={categoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by category..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map(cat => <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <Button asChild>
                <Link href="/admin/products/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                </Link>
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Products</CardTitle>
          <CardDescription>View, create, edit, and manage your products.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : products && products.length > 0 ? (
                  products.map((product) => {
                    const isSimple = !product.hasVariants;
                    const firstVariant = product.variants?.[0];
                    const inStock = isSimple ? product.inStock : product.variants?.some(v => v.inStock);
                    const price = isSimple ? product.price : firstVariant?.price;
                    const imageUrl = product.images?.[0] || `https://picsum.photos/seed/${product.slug}/100`;

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                            <div className="relative h-12 w-12 rounded-md overflow-hidden">
                                <Image src={imageUrl} alt={product.name} fill className="object-cover" />
                            </div>
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-muted-foreground">{categories?.find(c => c.slug === product.categorySlug)?.name || product.categorySlug}</TableCell>
                        <TableCell>৳{(price ?? 0).toFixed(2)}</TableCell>
                        <TableCell>
                            <Badge variant={inStock ? 'default' : 'secondary'} className={inStock ? 'bg-green-500' : 'bg-yellow-500'}>
                                {inStock ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.isActive ? 'default' : 'secondary'} className={product.isActive ? 'bg-blue-500' : ''}>
                            {product.isActive ? 'Visible' : 'Hidden'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem asChild><Link href={`/products/${product.slug}`} target="_blank"><Eye className="mr-2 h-4 w-4" /> View</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href={`/admin/products/${product.id}/edit`}><Pen className="mr-2 h-4 w-4" /> Edit</Link></DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(product)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">No products found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
           <div className="md:hidden space-y-4">
              {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
              ) : products && products.length > 0 ? (
                  products.map(product => {
                    const isSimple = !product.hasVariants;
                    const firstVariant = product.variants?.[0];
                    const inStock = isSimple ? product.inStock : product.variants?.some(v => v.inStock);
                    const price = isSimple ? product.price : firstVariant?.price;
                    const imageUrl = product.images?.[0] || `https://picsum.photos/seed/${product.slug}/100`;

                    return (
                        <Card key={product.id} className="p-4">
                            <div className="flex gap-4">
                                <div className="relative h-20 w-20 rounded-md overflow-hidden shrink-0">
                                    <Image src={imageUrl} alt={product.name} fill className="object-cover" />
                                </div>
                                <div className="flex-grow">
                                    <p className="font-bold">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">৳{(price ?? 0).toFixed(2)}</p>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant={inStock ? 'default' : 'secondary'} className={inStock ? 'bg-green-500' : 'bg-yellow-500'}>
                                            {inStock ? 'In Stock' : 'Out of Stock'}
                                        </Badge>
                                        <Badge variant={product.isActive ? 'default' : 'secondary'} className={product.isActive ? 'bg-blue-500' : ''}>
                                            {product.isActive ? 'Visible' : 'Hidden'}
                                        </Badge>
                                    </div>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem asChild><Link href={`/products/${product.slug}`} target="_blank"><Eye className="mr-2 h-4 w-4" /> View</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href={`/admin/products/${product.id}/edit`}><Pen className="mr-2 h-4 w-4" /> Edit</Link></DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDelete(product)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </Card>
                    )
                  })
              ) : (
                 <p className="py-10 text-center text-muted-foreground">No products found.</p>
              )}
          </div>
        </CardContent>
      </Card>
      
      {selectedProduct && (
        <DeleteDialog
            isOpen={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={performDelete}
            title="Delete Product"
            description={`Are you sure you want to delete the product "${selectedProduct.name}"? This action cannot be undone.`}
        />
      )}
    </div>
  );
}

    