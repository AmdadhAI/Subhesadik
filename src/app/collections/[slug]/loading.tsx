
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

function ProductCardSkeleton() {
    return (
        <Card className="flex flex-col overflow-hidden h-full">
            <CardHeader className="p-0">
                <Skeleton className="aspect-square w-full" />
            </CardHeader>
            <CardContent className="p-4 flex-grow space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-8 w-1/2" />
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Skeleton className="h-10 w-24" />
            </CardFooter>
        </Card>
    );
}


export default function ProductListLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Breadcrumb Skeleton */}
        <Skeleton className="h-6 w-1/3" />
        
        {/* Title Skeleton */}
        <Skeleton className="h-12 w-1/2" />
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
