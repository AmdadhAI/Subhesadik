'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Product, ProductVariant } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as CardDescriptionUI } from '../ui/card';
import { useFirestore } from '@/firebase';
import { doc, setDoc, runTransaction, serverTimestamp, query, collection, where, getDocs } from 'firebase/firestore';
import { ImageUploader } from './image-uploader';

const variantSchema = z.object({
    name: z.string().min(1, 'Variant name is required'),
    price: z.coerce.number().min(0, 'Price must be a positive number.'),
    oldPrice: z.coerce.number().optional(),
    inStock: z.boolean(),
});

const productFormSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    slug: z.string().min(2, 'Slug is required'),
    categorySlug: z.string().min(1, 'Please select a category.'),
    description: z.string().optional(),
    features: z.string().optional(),
    images: z.array(z.object({ url: z.string().url('Invalid URL format.') })).min(1, 'At least one image URL is required.'),
    videoUrl: z.string().url('Invalid URL format.').optional().or(z.literal('')),
    isActive: z.boolean(),

    // Type discriminator
    hasVariants: z.boolean(),

    // Simple product fields
    price: z.coerce.number().optional(),
    oldPrice: z.coerce.number().optional(),
    inStock: z.boolean().optional(),

    // Variable product fields
    variantType: z.enum(['weight', 'volume', 'size', 'custom']).optional(),
    variants: z.array(variantSchema).optional(),

}).superRefine((data, ctx) => {
    if (data.hasVariants) {
        if (!data.variants || data.variants.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['variants'],
                message: 'At least one product variant is required for variable products.',
            });
        }
        if (!data.variantType) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['variantType'],
                message: 'Variant type is required when product has variants.',
            });
        }
    } else { // Simple product
        if (data.price === undefined || data.price < 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['price'],
                message: 'A valid price is required for simple products.',
            });
        }
        if (data.inStock === undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['inStock'],
                message: 'Stock status is required for simple products.',
            });
        }
    }
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
    categories: { id: string; name: string; slug: string }[];
    product?: (Omit<Product, 'createdAt'> & { createdAt: string }) | null;
}

export function ProductForm({ categories, product }: ProductFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const firestore = useFirestore();

    const defaultValues: Partial<ProductFormValues> = product ? {
        ...product,
        hasVariants: product.hasVariants ?? (product.variants && product.variants.length > 0)!,
        features: product.features.join(', '),
        images: product.images.map(url => ({ url })),
        videoUrl: product.videoUrl || '',
        price: product.price ?? 0,
        oldPrice: product.oldPrice ?? undefined,
        inStock: product.inStock ?? true,
        variants: product.variants?.length ? product.variants : [{ name: 'Standard', price: 0, inStock: true }],
    } : {
        name: '',
        slug: '',
        isActive: true,
        hasVariants: false, // Default to simple product
        price: 0,
        inStock: true,
        variants: [],
        images: [{ url: 'https://picsum.photos/seed/1/600/600' }],
        videoUrl: '',
        features: '',
    };

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues,
    });

    const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
        name: "images",
        control: form.control,
    });

    const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
        name: "variants",
        control: form.control,
    });

    const watchedName = form.watch('name');
    const hasVariants = form.watch('hasVariants');

    useEffect(() => {
        if (watchedName && !form.formState.dirtyFields.slug) {
            form.setValue('slug', slugify(watchedName), { shouldValidate: true });
        }
    }, [watchedName, form]);

    async function isSlugUnique(slug: string, currentId?: string): Promise<boolean> {
        if (!firestore) return false;
        const q = query(collection(firestore, 'products'), where('slug', '==', slug));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return true;
        if (currentId) return snapshot.docs.every(doc => doc.id === currentId);
        return false;
    }

    async function onSubmit(data: ProductFormValues) {
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Database not available.' });
            return;
        }

        if (!await isSlugUnique(data.slug, product?.id)) {
            form.setError('slug', { message: 'This slug is already in use.' });
            return;
        }

        const productDataToSave: any = {
            ...data,
            features: data.features?.split(',').map(f => f.trim()).filter(Boolean) || [],
            images: data.images.map(img => img.url),
        };

        if (data.hasVariants) {
            delete productDataToSave.price;
            delete productDataToSave.oldPrice;
            delete productDataToSave.inStock;
            productDataToSave.variants = data.variants?.map(v => ({
                ...v,
                oldPrice: (v.oldPrice === undefined || isNaN(v.oldPrice) || v.oldPrice <= 0) ? null : v.oldPrice,
            }));
        } else {
            delete productDataToSave.variants;
            delete productDataToSave.variantType;
            if (!productDataToSave.oldPrice || productDataToSave.oldPrice <= 0) {
                delete productDataToSave.oldPrice;
            }
        }

        if (!productDataToSave.videoUrl) {
            delete productDataToSave.videoUrl;
        }

        try {
            if (product) { // Update
                await runTransaction(firestore, async (transaction) => {
                    const oldDocRef = doc(firestore, 'products', product.id);
                    if (data.slug !== product.id) {
                        transaction.delete(oldDocRef);
                    }
                    const newDocRef = doc(firestore, 'products', data.slug);
                    transaction.set(newDocRef, {
                        ...productDataToSave,
                        createdAt: product.createdAt ? new Date(product.createdAt) : serverTimestamp()
                    }, { merge: true });
                });
            } else { // Create
                const newDocRef = doc(firestore, 'products', data.slug);
                await setDoc(newDocRef, { ...productDataToSave, createdAt: serverTimestamp() });
            }

            toast({ title: 'Success', description: `Product ${product ? 'updated' : 'created'}.` });

            // Force router refresh to prevent UI freeze
            router.refresh();

            // Use setTimeout to ensure toast is visible before navigation
            setTimeout(() => {
                // Hard navigation to ensure proper state reset
                window.location.href = '/admin/products';
            }, 500);

        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Name</FormLabel>
                                        <FormControl><Input placeholder="e.g., Raw Natural Honey" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="slug" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug</FormLabel>
                                        <FormControl><Input placeholder="e.g., raw-natural-honey" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl><Textarea rows={5} placeholder="Describe the product..." {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="features" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Features</FormLabel>
                                        <FormControl><Input placeholder="Feature 1, Feature 2, Feature 3" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormDescription>Enter key features separated by commas.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing & Variants</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="hasVariants"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>This product has variants</FormLabel>
                                                <FormDescription>Enable if the product comes in different sizes, weights, etc.</FormDescription>
                                            </div>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}
                                />

                                {hasVariants ? (
                                    <div className="space-y-6 p-4 border rounded-lg">
                                        <FormField
                                            control={form.control}
                                            name="variantType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Variant Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger><SelectValue placeholder="Select a variant type" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="weight">Weight (e.g., g, kg)</SelectItem>
                                                            <SelectItem value="volume">Volume (e.g., ml, L)</SelectItem>
                                                            <SelectItem value="size">Size (e.g., S, M, L)</SelectItem>
                                                            <SelectItem value="custom">Custom</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <CardDescriptionUI>Manage product variants like sizes or weights, each with its own price.</CardDescriptionUI>
                                        {variantFields.map((field, index) => (
                                            <div key={field.id} className="p-4 border rounded-lg relative space-y-4 bg-muted/50">
                                                <h4 className="font-medium text-md">Variant {index + 1}</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <FormField control={form.control} name={`variants.${index}.name`} render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Name</FormLabel>
                                                            <FormControl><Input placeholder="e.g., 500g or Large" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name={`variants.${index}.price`} render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Price</FormLabel>
                                                            <FormControl><Input type="number" step="0.01" placeholder="e.g., 750" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name={`variants.${index}.oldPrice`} render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Old Price (Optional)</FormLabel>
                                                            <FormControl><Input type="number" step="0.01" placeholder="e.g., 850" {...field} value={field.value ?? ''} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name={`variants.${index}.inStock`} render={({ field }) => (
                                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm sm:col-span-2 bg-background">
                                                            <FormLabel>In Stock</FormLabel>
                                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                        </FormItem>
                                                    )} />
                                                </div>
                                                {variantFields.length > 1 && (
                                                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeVariant(index)}>
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" onClick={() => appendVariant({ name: '', price: 0, inStock: true })}>
                                            <PlusCircle className="mr-2" /> Add Variant
                                        </Button>
                                        {form.formState.errors.variants && <p className="text-sm font-medium text-destructive">{form.formState.errors.variants.message}</p>}
                                    </div>
                                ) : (
                                    <div className="space-y-4 p-4 border rounded-lg">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="price" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Price</FormLabel>
                                                    <FormControl><Input type="number" step="0.01" placeholder="e.g., 750" {...field} value={field.value ?? ''} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="oldPrice" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Old Price (Optional)</FormLabel>
                                                    <FormControl><Input type="number" step="0.01" placeholder="e.g., 850" {...field} value={field.value ?? ''} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <FormField control={form.control} name="inStock" render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                                                <FormLabel>In Stock</FormLabel>
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            </FormItem>
                                        )} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Media</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {imageFields.map((field, index) => (
                                    <FormField
                                        key={field.id}
                                        control={form.control}
                                        name={`images.${index}.url`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Image {index + 1}</FormLabel>
                                                <div className="flex items-start gap-2">
                                                    <div className="flex-grow">
                                                        <ImageUploader
                                                            uploadPath="products"
                                                            onUrlChange={field.onChange}
                                                            currentUrl={field.value}
                                                            formFieldName={field.name}
                                                        />
                                                    </div>
                                                    {imageFields.length > 1 && (
                                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeImage(index)} className="mt-1">
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => appendImage({ url: `https://picsum.photos/seed/${imageFields.length + 1}/600/600` })}>
                                    Add Image
                                </Button>
                                <FormField
                                    control={form.control}
                                    name="videoUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Video URL (Optional)</FormLabel>
                                            <FormControl><Input placeholder="https://www.youtube.com/watch?v=..." {...field} value={field.value ?? ''} /></FormControl>
                                            <FormDescription>Enter a product video URL (e.g., from YouTube).</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Organize</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="categorySlug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map(cat => <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
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
                                                <FormLabel>Visible</FormLabel>
                                                <FormDescription>Is this product visible to customers?</FormDescription>
                                            </div>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Saving...' : 'Save Product'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
