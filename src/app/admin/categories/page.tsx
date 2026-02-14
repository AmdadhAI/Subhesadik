'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import type { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Pen, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CategoryDialog } from '@/components/admin/category-dialog';
import { DeleteDialog } from '@/components/admin/delete-dialog';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminCategoriesPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const categoriesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'categories'), orderBy('order', 'asc'));
  }, [firestore]);

  const { data: categories, isLoading } = useCollection<Category>(categoriesQuery);

  const handleAdd = () => {
    setSelectedCategory(null);
    setDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };
  
  const performDelete = async () => {
      if (!selectedCategory || !firestore) return;
      try {
        await deleteDoc(doc(firestore, 'categories', selectedCategory.id));
        toast({ title: 'Success', description: 'Category deleted.' });
      } catch(e: any) {
          toast({ variant: 'destructive', title: 'Error', description: e.message });
      }
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>View, create, edit, and manage your product categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Image</TableHead>
                  <TableHead className="w-16">Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                          {category.imageUrl && (
                             <div className="relative h-12 w-12 rounded-md overflow-hidden">
                                <Image src={category.imageUrl} alt={category.name} fill className="object-cover" />
                            </div>
                          )}
                      </TableCell>
                      <TableCell className="font-medium">{category.order}</TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{category.slug}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={category.isActive ? 'default' : 'secondary'} className={category.isActive ? 'bg-green-500' : ''}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEdit(category)}><Pen className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(category)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">No categories found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="md:hidden space-y-4">
              {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
              ) : categories && categories.length > 0 ? (
                  categories.map(category => (
                    <Card key={category.id} className="p-4 flex justify-between items-center">
                       {category.imageUrl && (
                         <div className="relative h-16 w-16 rounded-md overflow-hidden shrink-0">
                            <Image src={category.imageUrl} alt={category.name} fill className="object-cover" />
                        </div>
                        )}
                        <div className="flex-grow ml-4">
                            <p className="font-bold">{category.name}</p>
                            <p className="text-sm text-muted-foreground">Order: {category.order}</p>
                            <Badge variant={category.isActive ? 'default' : 'secondary'} className={`mt-2 ${category.isActive ? 'bg-green-500' : ''}`}>
                                {category.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEdit(category)}><Pen className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(category)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </Card>
                  ))
              ) : (
                 <p className="py-10 text-center text-muted-foreground">No categories found.</p>
              )}
          </div>

        </CardContent>
      </Card>
      
      <CategoryDialog 
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        category={selectedCategory}
      />
      
      {selectedCategory && (
        <DeleteDialog
            isOpen={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={performDelete}
            title="Delete Category"
            description={`Are you sure you want to delete the "${selectedCategory.name}" category? This action cannot be undone.`}
        />
      )}
    </div>
  );
}
