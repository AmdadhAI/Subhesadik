'use client';
import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { CategoryCard } from './category-card';
import type { Category } from '@/lib/types';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeaturedCategoriesCarouselProps {
  categories: Omit<Category, 'createdAt'>[];
}

export function FeaturedCategoriesCarousel({ categories }: FeaturedCategoriesCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [
    Autoplay({ delay: 2400, stopOnInteraction: true }),
  ]);

  const scrollPrev = React.useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <div className="relative -mx-2">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {categories.map((category) => (
            <div key={category.id} className="pl-4 shrink-0 basis-[45%] sm:basis-1/3 lg:basis-1/4">
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      </div>
      <div className="hidden md:block">
        <Button variant="outline" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 z-10 shadow-md" onClick={scrollPrev}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Previous Category</span>
        </Button>
        <Button variant="outline" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 z-10 shadow-md" onClick={scrollNext}>
            <ArrowRight className="h-5 w-5" />
            <span className="sr-only">Next Category</span>
        </Button>
      </div>
    </div>
  );
}
