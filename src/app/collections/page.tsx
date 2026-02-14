import { getCategories, getProducts } from '@/lib/firebase-data';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Image from 'next/image';
import { Package } from 'lucide-react';

export default async function AllCollectionsPage() {
  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getProducts() // Fetch all products once for efficiency
  ]);

  // Create a map of categories to their first product's image for quick lookup
  const categoryImageMap = new Map<string, string>();
  allProducts.forEach(product => {
    if (!categoryImageMap.has(product.categorySlug)) {
      categoryImageMap.set(product.categorySlug, product.images[0]);
    }
  });

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
              <BreadcrumbPage>Categories</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <h1 className="font-headline text-4xl font-bold">All Categories</h1>
        
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category) => {
              const imageUrl = category.imageUrl || categoryImageMap.get(category.slug) || `https://picsum.photos/seed/${category.slug}/400/300`;
              
              return (
                <Link key={category.id} href={`/collections/${category.slug}`} className="block group">
                  <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
                    <div className="relative aspect-video w-full">
                       <Image 
                          src={imageUrl} 
                          alt={category.name} 
                          fill 
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          data-ai-hint="category image"
                        />
                       <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <h2 className="text-xl font-bold text-white text-center p-2 drop-shadow-md">{category.name}</h2>
                       </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg">
            <Package className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No categories found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
