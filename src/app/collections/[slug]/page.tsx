import { getCategory, getProducts } from '@/lib/firebase-data';
import { notFound } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ProductCard } from '@/components/product-card';
import type { SerializedProduct } from '@/types/serialized';
import { STATIC_CATEGORIES } from '@/config/categories';

export default async function CollectionPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // 1. Try to find in hardcoded categories first (FAST & prevents 404s for new manual categories)
  let category = STATIC_CATEGORIES.find(c => c.slug === slug);

  // 2. If not found, try fetching from database (Legacy support)
  if (!category) {
    const dbCategory = await getCategory(slug);
    if (dbCategory) {
      category = {
        ...dbCategory,
        // Ensure compatibility with STATIC_CATEGORIES type if needed
      };
    }
  }

  // 3. If still not found, 404
  if (!category) {
    notFound();
  }

  const productsData = await getProducts(slug);
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
              <BreadcrumbLink href="/collections">Categories</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{category.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="font-headline text-4xl font-bold">{category.name}</h1>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No products found in this category.</p>
        )}
      </div>
    </div>
  );
}
