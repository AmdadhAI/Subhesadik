import type { Category } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

interface CategoryCardProps {
  category: Omit<Category, 'createdAt'>;
}

export function CategoryCard({ category }: CategoryCardProps) {
  let displayUrl = category.imageUrl || `https://picsum.photos/seed/${category.slug}/400/400`;

  // This is a defensive check. It seems an optimized Next.js image URL is sometimes being saved to the database.
  // This will extract the original URL from the `url` query parameter if it exists.
  try {
    const urlObject = new URL(displayUrl);
    if (urlObject.pathname.startsWith('/_next/image')) {
      const originalUrl = urlObject.searchParams.get('url');
      if (originalUrl) {
        displayUrl = originalUrl;
      }
    }
  } catch (error) {
    // If the URL is invalid, we'll let Next/Image handle the error downstream, but this prevents a crash.
    console.warn(`Invalid image URL detected for category ${category.name}:`, displayUrl);
  }
  
  return (
    <Link href={`/collections/${category.slug}`} className="block group">
      <Card className="overflow-hidden transition-all duration-250 ease-out group-hover:shadow-xl group-hover:-translate-y-1">
        <div className="relative aspect-square w-full">
           <Image 
              src={displayUrl} 
              alt={category.name} 
              fill 
              className="object-cover transition-transform duration-250 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
              data-ai-hint="category image"
            />
           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-colors duration-250 group-hover:from-black/60" />
           <div className="absolute bottom-0 left-0 p-3">
              <h3 className="text-base font-bold text-white drop-shadow-md line-clamp-2">{category.name}</h3>
           </div>
        </div>
      </Card>
    </Link>
  );
}
