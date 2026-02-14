import type { SerializedProduct } from '@/types/serialized';
import { ProductCard } from './product-card';

interface RelatedProductsProps {
  products: SerializedProduct[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length < 2) {
    return null;
  }

  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold font-headline mb-6">Related Products</h2>
      </div>
      <div className="pl-4 sm:pl-6 lg:pl-8">
        <div className="flex overflow-x-auto pb-6 -mb-6 gap-4">
          {products.map((product, index) => (
            <div key={product.id} className="w-[45vw] sm:w-64 flex-shrink-0">
              <ProductCard product={product} priority={index < 2} />
            </div>
          ))}
          {/* Add a spacer to the end to ensure padding is visible on scroll */}
          <div className="w-1 h-1 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}
