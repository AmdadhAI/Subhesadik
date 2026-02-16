import { getProducts } from '@/lib/firebase-data';
import { ProductCard } from '@/components/product-card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import type { SerializedProduct } from '@/types/serialized';

// Revalidate every 60 seconds (ISR - Incremental Static Regeneration)
// New products will appear within 1 minute
export const revalidate = 60;

export default async function AllProductsPage() {
  const productsData = await getProducts();

  const products: SerializedProduct[] = productsData.map(p => ({
    ...p,
    createdAt: p.createdAt.toDate().toISOString(),
  }));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>All Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="font-headline text-4xl font-bold">All Products</h1>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      </div>
    </div>
  );
}
