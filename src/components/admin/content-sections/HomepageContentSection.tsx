'use client'

import type { UseFormReturn } from 'react-hook-form'
import { useFieldArray } from 'react-hook-form'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent } from '@/components/ui/card'
import { FormField, FormItem, FormLabel, FormMessage, FormDescription, FormControl } from '@/components/ui/form'
import { ImageUploader } from '@/components/admin/image-uploader'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ProductSelector } from '@/components/admin/product-selector'
import { CategorySelector } from '@/components/admin/category-selector'
import { Home, PlusCircle, Trash2 } from 'lucide-react'

interface SectionProps {
    form: UseFormReturn<any>;
}

export function HomepageContentSection({ form }: SectionProps) {
    const { control, watch } = form;
    const watchHeroMode = watch('heroMode');

    const { fields, append, remove } = useFieldArray({
        control: control,
        name: "heroCarouselSlides",
    });

    return (
        <AccordionItem value="homepage-content">
            <AccordionTrigger>
                <div className="flex items-center gap-3 text-left">
                    <div className="bg-muted p-2 rounded-lg">
                        <Home className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Homepage Content</h3>
                        <p className="text-sm text-muted-foreground">Control the content displayed on your homepage.</p>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <Card className="border-none">
                    <CardContent className="pt-6">
                        <Accordion type="multiple" className="w-full space-y-4">

                            {/* Hero Section */}
                            <AccordionItem value="hero-section">
                                <AccordionTrigger className="font-semibold text-lg bg-muted/50 px-4 rounded-md">Hero Section</AccordionTrigger>
                                <AccordionContent className="pt-4 px-2">
                                    <div className="space-y-6">
                                        <FormField
                                            control={control}
                                            name="heroMode"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel>Hero Display Mode</FormLabel>
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                            className="flex flex-col space-y-1"
                                                        >
                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value="single" />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">
                                                                    Single Image Hero
                                                                </FormLabel>
                                                            </FormItem>
                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value="carousel" />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">
                                                                    Carousel Hero
                                                                </FormLabel>
                                                            </FormItem>
                                                        </RadioGroup>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {watchHeroMode === 'single' && (
                                            <Card className="p-4 bg-muted/30">
                                                <div className="space-y-4">
                                                    <FormField control={control} name="heroTitle" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Hero Title</FormLabel>
                                                            <FormControl><Input placeholder="Welcome to Subhe Sadik" {...field} value={field.value || ''} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={control} name="heroSubtitle" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Hero Subtitle</FormLabel>
                                                            <FormControl><Input placeholder="Minimalist design, maximum satisfaction." {...field} value={field.value || ''} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={control} name="heroImageUrl" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Hero Image</FormLabel>
                                                            <FormControl><ImageUploader uploadPath="site" onUrlChange={field.onChange} currentUrl={field.value || ''} formFieldName="heroImageUrl" /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={control} name="heroCtaText" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>CTA Button Text</FormLabel>
                                                            <FormControl><Input placeholder="Shop Now" {...field} value={field.value || ''} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={control} name="heroCtaLink" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>CTA Button Link</FormLabel>
                                                            <FormControl><Input placeholder="/products" {...field} value={field.value || ''} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </div>
                                            </Card>
                                        )}

                                        {watchHeroMode === 'carousel' && (
                                            <Card className="p-4 bg-muted/30">
                                                <div className="space-y-6">
                                                    {fields.map((slide, index) => (
                                                        <Accordion key={slide.id} type="single" collapsible className="w-full">
                                                            <AccordionItem value={`slide-${index}`} className="border rounded-md bg-background">
                                                                <AccordionTrigger className="px-4">
                                                                    <div className="flex justify-between items-center w-full">
                                                                        <h4 className="font-semibold">Slide {index + 1}</h4>
                                                                        {/* Phase Two Fix: Avoid button-in-button nesting. AccordionTrigger renders a button, so use div here. */}
                                                                        <div
                                                                            role="button"
                                                                            tabIndex={0}
                                                                            onClick={(e) => { e.stopPropagation(); remove(index); }}
                                                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); remove(index); } }}
                                                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-destructive/10 h-8 w-8 text-destructive cursor-pointer"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </div>
                                                                    </div>
                                                                </AccordionTrigger>
                                                                <AccordionContent className="p-4">
                                                                    <div className="space-y-4">
                                                                        <FormField control={control} name={`heroCarouselSlides.${index}.isActive`} render={({ field }) => (
                                                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                                                                                <FormLabel>Show this slide</FormLabel>
                                                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                                            </FormItem>
                                                                        )} />
                                                                        <FormField control={control} name={`heroCarouselSlides.${index}.title`} render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>Title</FormLabel>
                                                                                <FormControl><Input placeholder="Slide Title" {...field} /></FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )} />
                                                                        <FormField control={control} name={`heroCarouselSlides.${index}.subtitle`} render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>Subtitle</FormLabel>
                                                                                <FormControl><Input placeholder="Slide Subtitle" {...field} /></FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )} />
                                                                        <FormField control={control} name={`heroCarouselSlides.${index}.imageUrl`} render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>Image</FormLabel>
                                                                                <FormControl><ImageUploader uploadPath="site" onUrlChange={field.onChange} currentUrl={field.value} formFieldName={`heroCarouselSlides.${index}.imageUrl`} /></FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )} />
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <FormField control={control} name={`heroCarouselSlides.${index}.ctaText`} render={({ field }) => (
                                                                                <FormItem>
                                                                                    <FormLabel>CTA Text</FormLabel>
                                                                                    <FormControl><Input placeholder="Shop Now" {...field} /></FormControl>
                                                                                    <FormMessage />
                                                                                </FormItem>
                                                                            )} />
                                                                            <FormField control={control} name={`heroCarouselSlides.${index}.ctaLink`} render={({ field }) => (
                                                                                <FormItem>
                                                                                    <FormLabel>CTA Link</FormLabel>
                                                                                    <FormControl><Input placeholder="/products" {...field} /></FormControl>
                                                                                    <FormMessage />
                                                                                </FormItem>
                                                                            )} />
                                                                        </div>
                                                                    </div>
                                                                </AccordionContent>
                                                            </AccordionItem>
                                                        </Accordion>
                                                    ))}
                                                    <Button type="button" variant="outline" onClick={() => append({ id: Date.now().toString(), title: '', subtitle: '', imageUrl: 'https://picsum.photos/seed/new-slide/1920/1080', ctaText: '', ctaLink: '', isActive: true })}>
                                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Slide
                                                    </Button>
                                                </div>
                                            </Card>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Featured Categories Section */}
                            <AccordionItem value="featured-categories">
                                <AccordionTrigger className="font-semibold text-lg bg-muted/50 px-4 rounded-md">Featured Categories</AccordionTrigger>
                                <AccordionContent className="pt-4 px-2">
                                    <Card className="p-4 bg-muted/30">
                                        <div className="space-y-4">
                                            <FormField
                                                control={control}
                                                name="featuredCategories.isEnabled"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                                                        <div className="space-y-0.5">
                                                            <FormLabel>Show "Featured Categories" section</FormLabel>
                                                        </div>
                                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={control}
                                                name="featuredCategories.title"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Section Title</FormLabel>
                                                        <FormControl><Input placeholder="e.g., Shop by Category" {...field} value={field.value || ''} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={control}
                                                name="featuredCategories.categoryIds"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Selected Categories</FormLabel>
                                                        <FormControl>
                                                            <CategorySelector
                                                                selectedCategoryIds={field.value || []}
                                                                onCategoryIdsChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>Search for and select the categories to feature.</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </Card>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Top Products Section */}
                            <AccordionItem value="top-products">
                                <AccordionTrigger className="font-semibold text-lg bg-muted/50 px-4 rounded-md">Top Products</AccordionTrigger>
                                <AccordionContent className="pt-4 px-2">
                                    <Card className="p-4 bg-muted/30">
                                        <div className="space-y-4">
                                            <FormField
                                                control={control}
                                                name="topProducts.isEnabled"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                                                        <div className="space-y-0.5">
                                                            <FormLabel>Show "Top Products" section</FormLabel>
                                                        </div>
                                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={control}
                                                name="topProducts.title"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Section Title</FormLabel>
                                                        <FormControl><Input placeholder="e.g., Best Sellers" {...field} value={field.value || ''} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={control}
                                                name="topProducts.productIds"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Selected Products</FormLabel>
                                                        <FormControl>
                                                            <ProductSelector
                                                                selectedProductIds={field.value || []}
                                                                onProductIdsChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>Search, add, and reorder the products to display.</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </Card>
                                </AccordionContent>
                            </AccordionItem>

                        </Accordion>
                    </CardContent>
                </Card>
            </AccordionContent>
        </AccordionItem>
    )
}
