'use client';

import { useState, useEffect } from 'react';
import type { SerializedProduct, SerializedCategory, ProductVariant } from '@/types/serialized';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ProductActions } from '@/components/product-actions';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ProductQuickContact } from './product-quick-contact';
import { RelatedProducts } from './related-products';

interface ProductViewProps {
  product: SerializedProduct;
  category: SerializedCategory | null;
  relatedProducts: SerializedProduct[];
}

function getYouTubeEmbedUrl(url: string): string | null {
    if (!url) return null;
    let videoId: string | null = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
            videoId = urlObj.searchParams.get('v');
        } else if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        }
    } catch (e) {
        console.error("Invalid video URL:", e);
        return null;
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

export function ProductView({ product, category, relatedProducts }: ProductViewProps) {
  const getInitialVariant = (): ProductVariant => {
    if (!product.hasVariants) {
      return {
        name: '',
        price: product.price ?? 0,
        oldPrice: product.oldPrice,
        inStock: product.inStock ?? false,
      };
    }
    return product.variants?.find(v => v.inStock) || product.variants?.[0] || { name: '', price: 0, inStock: false };
  };

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(getInitialVariant());
  const [showVariantWarning, setShowVariantWarning] = useState(false);

  const youTubeEmbedUrl = product.videoUrl ? getYouTubeEmbedUrl(product.videoUrl) : null;
  
  // This effect ensures that when switching between products, the variant state is reset correctly.
  useEffect(() => {
    setSelectedVariant(getInitialVariant());
  }, [product.id]);
  
  if (!selectedVariant) {
      return <div>This product is currently unavailable.</div>;
  }
  
  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="space-y-8">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    {category && (
                        <>
                            <BreadcrumbItem><BreadcrumbLink href={`/collections/${category.slug}`}>{category.name}</BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbSeparator />
                        </>
                    )}
                    <BreadcrumbItem><BreadcrumbPage>{product.name}</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <Card>
                <CardContent className="p-6 grid md:grid-cols-2 gap-8 lg:gap-12">
                <div className="md:sticky top-24 self-start">
                    <Carousel className="w-full max-w-md mx-auto">
                        <CarouselContent>
                            {youTubeEmbedUrl && (
                                <CarouselItem key="video">
                                    <div className="aspect-video relative rounded-lg overflow-hidden bg-black">
                                        <iframe src={youTubeEmbedUrl} title="Product video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="w-full h-full"></iframe>
                                    </div>
                                </CarouselItem>
                            )}
                            {product.images.map((img, index) => (
                                <CarouselItem key={index}>
                                    <div className="aspect-square relative rounded-lg overflow-hidden">
                                        <Image src={img} alt={`${product.name} image ${index + 1}`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" data-ai-hint="product image" priority={index === 0}/>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                    </Carousel>
                </div>

                <div className="flex flex-col gap-6">
                    <h1 className="font-headline text-3xl md:text-4xl font-bold">{product.name}</h1>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-primary">৳{selectedVariant.price.toFixed(2)}</span>
                            {selectedVariant.oldPrice && (<span className="text-lg text-muted-foreground line-through">৳{selectedVariant.oldPrice.toFixed(2)}</span>)}
                        </div>
                        {selectedVariant.inStock ? (<Badge variant="default">In Stock</Badge>) : (<Badge variant="secondary">Out of Stock</Badge>)}
                    </div>
                    
                    {product.hasVariants && product.variants && product.variants.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Choose Unit:</h3>
                            <RadioGroup value={selectedVariant.name} onValueChange={(value) => {
                                const newVariant = product.variants!.find(v => v.name === value);
                                if (newVariant) setSelectedVariant(newVariant);
                                setShowVariantWarning(false);
                            }} className="flex flex-wrap gap-2">
                                {product.variants.map(variant => (
                                    <div key={variant.name}>
                                        <RadioGroupItem value={variant.name} id={`variant-${variant.name}`} className="sr-only peer" disabled={!variant.inStock} />
                                        <Label htmlFor={`variant-${variant.name}`} className="cursor-pointer flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary min-w-[60px] peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-disabled:hover:bg-popover">
                                            {variant.name}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                            {showVariantWarning && <p className="text-sm font-medium text-destructive flex items-center gap-1"><AlertTriangle className="h-4 w-4" />Please select a unit.</p>}
                        </div>
                    )}

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Key Features:</h3>
                        <ul className="space-y-2 list-inside">
                            {product.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <ProductActions product={product} selectedVariant={selectedVariant} />
                    
                    <div className="pt-6">
                        <ProductQuickContact product={product} />
                    </div>

                    <div className="space-y-6 pt-6 border-t">
                        <div className="pt-2">
                            <h3 className="font-semibold text-lg">Product Description</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap mt-2">{product.description}</p>
                        </div>
                    </div>
                </div>
                </CardContent>
            </Card>
        </div>
      </div>
      <RelatedProducts products={relatedProducts} />
    </>
  );
}
