'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Category } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp, runTransaction, getDocs, query, collection, where } from 'firebase/firestore';
import { ImageUploader } from './image-uploader';

const categoryFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  slug: z.string().min(2, { message: 'Slug must be at least 2 characters.' }),
  order: z.coerce.number().min(0, { message: 'Order must be a positive number.' }),
  isActive: z.boolean(),
  imageUrl: z.string().url({ message: 'Must be a valid URL.' }).optional().or(z.literal('')),
});

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

export function CategoryDialog({ isOpen, onClose, category }: CategoryDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      order: 0,
      isActive: true,
      imageUrl: '',
    },
  });
  
  const watchedName = form.watch('name');

  useEffect(() => {
    if (isOpen) {
      if (category) {
        form.reset({
            ...category,
            imageUrl: category.imageUrl || ''
        });
      } else {
        form.reset({ name: '', slug: '', order: 0, isActive: true, imageUrl: '' });
      }
      form.clearErrors();
    }
  }, [isOpen, category, form]);

  useEffect(() => {
      if (watchedName && !form.formState.dirtyFields.slug) {
        form.setValue('slug', slugify(watchedName), { shouldValidate: true });
      }
  }, [watchedName, form]);

  async function isSlugUnique(slug: string, currentId?: string): Promise<boolean> {
    if (!firestore) return false;
    const q = query(collection(firestore, 'categories'), where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return true;
    if (currentId) return snapshot.docs.every(doc => doc.id === currentId);
    return false;
  }

  async function onSubmit(data: z.infer<typeof categoryFormSchema>) {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Database not available.' });
      return;
    }

    if (!await isSlugUnique(data.slug, category?.id)) {
      form.setError('slug', { message: 'This slug is already in use.' });
      return;
    }

    const dataToSave = {
        ...data,
        imageUrl: data.imageUrl || null
    };

    try {
      if (category) { // Update
        await runTransaction(firestore, async (transaction) => {
          const oldDocRef = doc(firestore, 'categories', category.id);
          if (data.slug !== category.id) {
            transaction.delete(oldDocRef);
          }
          const newDocRef = doc(firestore, 'categories', data.slug);
          transaction.set(newDocRef, { ...dataToSave, createdAt: category.createdAt || serverTimestamp() }, { merge: true });
        });
      } else { // Create
        const newDocRef = doc(firestore, 'categories', data.slug);
        await setDoc(newDocRef, { ...dataToSave, createdAt: serverTimestamp() });
      }

      toast({ title: 'Success', description: `Category ${category ? 'updated' : 'created'}.` });
      onClose();

    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Create New Category'}</DialogTitle>
          <DialogDescription>
            {category ? 'Update the details for this category.' : 'Fill out the form to create a new category.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Organic Foods" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl><Input placeholder="e.g., organic-foods" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ImageUploader 
                        uploadPath="categories"
                        onUrlChange={field.onChange}
                        currentUrl={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <FormLabel>Active</FormLabel>
                            <DialogDescription>
                                If inactive, the category will be hidden from the store.
                            </DialogDescription>
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Category'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
