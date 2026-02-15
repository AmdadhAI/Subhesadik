import type { SerializedProduct, ProductVariant } from '@/types/serialized';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AddToCartButton from './add-to-cart-button';

interface ProductCardProps {
  product: SerializedProduct;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const isSimple = !product.hasVariants;

  const getDisplayVariant = (): ProductVariant => {
    if (isSimple) {
      return {
        name: '',
        price: product.price ?? 0,
        oldPrice: product.oldPrice,
        inStock: product.inStock ?? false,
      };
    }
    return product.variants?.[0] || { name: '', price: 0, inStock: false };
  };

  const displayVariant = getDisplayVariant();
  const inStock = isSimple ? product.inStock : product.variants?.some(v => v.inStock);
  const hasMultipleOptions = !isSimple && product.variants && product.variants.length > 1;

  return (
    <Card className="flex flex-col overflow-hidden h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
      <Link href={`/products/${product.slug}`} className="block">
        <CardHeader className="p-0">
          <div className="relative aspect-square w-full overflow-hidden">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
              priority={priority}
              data-ai-hint="product image"
            />
            {!inStock && (
              <Badge variant="secondary" className="absolute top-2 left-2">Out of Stock</Badge>
            )}
            {displayVariant.oldPrice && displayVariant.price < displayVariant.oldPrice && (
              <Badge variant="default" className="absolute top-2 right-2 bg-accent text-accent-foreground">Sale</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pb-0">
          <div className="h-12">
            <CardTitle className="text-base font-semibold leading-tight line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </CardTitle>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-4 mt-auto flex justify-between items-end h-16">
        <div className="h-full flex flex-col justify-end">
          {displayVariant.oldPrice && (
            <p className="text-sm text-muted-foreground line-through">
              ৳{displayVariant.oldPrice.toFixed(2)}
            </p>
          )}
          <p className="text-lg font-bold text-primary">
            ৳{displayVariant.price.toFixed(2)}
          </p>
        </div>
        {/* Pass the first variant or the simple product info to the button for quick add */}
        <AddToCartButton product={product} variant={displayVariant} size="icon" />
      </CardFooter>
    </Card>
  );
}
