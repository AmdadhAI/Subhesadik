
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function ProductLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Breadcrumb Skeleton */}
        <Skeleton className="h-6 w-1/2" />

        <Card>
          <CardContent className="p-6 grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Carousel Skeleton */}
            <div className="md:sticky top-24 self-start">
               <Skeleton className="w-full aspect-square rounded-lg" />
            </div>

            {/* Product Details Skeleton */}
            <div className="flex flex-col gap-6">
              <Skeleton className="h-12 w-full" />
              
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>

              <div className="space-y-4">
                  <Skeleton className="h-8 w-24" />
                  <div className="space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-5/6" />
                      <Skeleton className="h-5 w-full" />
                  </div>
              </div>
              
              {/* Actions Skeleton */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Skeleton className="h-11 w-full sm:w-auto flex-grow" />
                    <Skeleton className="h-11 w-full sm:w-auto flex-grow" />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <Skeleton className="h-8 w-48" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
