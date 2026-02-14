'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel, { EmblaCarouselType } from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getContent } from '@/lib/firebase-data';
import type { SiteContent, HeroSlide } from '@/lib/types';
import { cn } from '@/lib/utils';

const DotButton: React.FC<{ selected: boolean; onClick: () => void }> = ({ selected, onClick }) => (
  <button
    className={`h-3 w-3 rounded-full mx-1 transition-colors duration-300 ${selected ? 'bg-primary' : 'bg-background/50'}`}
    type="button"
    onClick={onClick}
    aria-label="Go to slide"
  />
);

function SingleHero({ slide }: { slide: Omit<HeroSlide, 'id' | 'isActive'> }) {
    return (
        <div className="relative flex-[0_0_100%] h-full">
            <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                className="object-cover"
                priority
                data-ai-hint={slide.imageHint || 'hero image'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white p-4 pb-12 md:pb-4 animate-hero-text-in motion-reduce:animate-none pointer-events-none">
                <h1 className="font-headline text-2xl md:text-4xl lg:text-6xl font-bold tracking-tight drop-shadow-lg max-w-xs md:max-w-2xl line-clamp-2">
                    {slide.title}
                </h1>
                <p className="mt-2 md:mt-4 text-sm md:text-lg lg:text-xl max-w-xs md:max-w-2xl drop-shadow-md">
                    {slide.subtitle}
                </p>
                <Button asChild size="lg" className="mt-6 md:mt-8 pointer-events-auto">
                    <Link href={slide.ctaLink}>{slide.ctaText}</Link>
                </Button>
            </div>
        </div>
    )
}

export function HeroCarousel() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlides, setActiveSlides] = useState<HeroSlide[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000, stopOnInteraction: true })]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // State for the text animation
  const [displayedSlide, setDisplayedSlide] = useState<HeroSlide | null>(null);
  const [isTextAnimatingOut, setIsTextAnimatingOut] = useState(false);

  useEffect(() => {
    async function fetchData() {
        try {
            const siteContent = await getContent();
            setContent(siteContent);
            const slides = siteContent.heroCarouselSlides?.filter(slide => slide.isActive) || [];
            setActiveSlides(slides);
            if (slides.length > 0) {
                setDisplayedSlide(slides[0]);
            }
        } catch (error) {
            console.error("Failed to fetch hero content", error);
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, []);

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onInit = useCallback((emblaApi: EmblaCarouselType) => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    if (!emblaApi) return;
    const newIndex = emblaApi.selectedScrollSnap();
    
    // Trigger fade-out animation
    setIsTextAnimatingOut(true);

    // After animation, update text content and trigger fade-in
    setTimeout(() => {
        setDisplayedSlide(activeSlides[newIndex]);
        setIsTextAnimatingOut(false);
        setSelectedIndex(newIndex);
    }, 200); // This duration must match the fade-out animation duration
  }, [activeSlides]);

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('select', onSelect);
    return () => {
        if(emblaApi) {
            emblaApi.off('reInit', onInit);
            emblaApi.off('select', onSelect);
        }
    }
  }, [emblaApi, onInit, onSelect]);
  
  if (isLoading || !content) {
      return (
          <section className="relative w-full bg-muted h-[60vh] md:h-[600px]">
              <Skeleton className="w-full h-full" />
          </section>
      )
  }
  
  const isCarouselMode = content.heroMode === 'carousel' && activeSlides.length > 0;

  return (
    <section className="relative w-full overflow-hidden bg-muted h-[60vh] md:h-[600px] md:aspect-auto">
      {!isCarouselMode ? (
        <SingleHero slide={{
            title: content.heroTitle || '',
            subtitle: content.heroSubtitle || '',
            imageUrl: content.heroImageUrl || 'https://picsum.photos/seed/default-hero/1920/1080',
            ctaText: content.heroCtaText || '',
            ctaLink: content.heroCtaLink || '/',
        }} />
      ) : (
        <>
            {/* Background Image Carousel */}
            <div className="absolute inset-0 z-0" ref={emblaRef}>
                <div className="flex h-full">
                {activeSlides.map((slide, index) => (
                    <div className="relative flex-[0_0_100%] h-full" key={slide.id}>
                        <Image
                            src={slide.imageUrl}
                            alt={slide.title}
                            fill
                            className="object-cover"
                            priority={index === 0}
                            data-ai-hint={slide.imageHint || 'hero image'}
                        />
                    </div>
                ))}
                </div>
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none" />
            
            {/* Foreground Text Content */}
            {displayedSlide && (
                <div 
                    className={cn(
                        "relative z-20 h-full flex flex-col items-center justify-center text-center text-white p-4 pb-12 md:pb-4 pointer-events-none",
                        "motion-reduce:animate-none",
                        isTextAnimatingOut 
                            ? 'animate-hero-text-out'
                            : 'animate-hero-text-in'
                    )}
                >
                    <h1 className="font-headline text-2xl md:text-4xl lg:text-6xl font-bold tracking-tight drop-shadow-lg max-w-xs md:max-w-2xl line-clamp-2">
                        {displayedSlide.title}
                    </h1>
                    <p className="mt-2 md:mt-4 text-sm md:text-lg lg:text-xl max-w-xs md:max-w-2xl drop-shadow-md">
                        {displayedSlide.subtitle}
                    </p>
                    <Button asChild size="lg" className="mt-6 md:mt-8 pointer-events-auto">
                        <Link href={displayedSlide.ctaLink}>{displayedSlide.ctaText}</Link>
                    </Button>
                </div>
            )}

            {/* Dots Navigation */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex">
                {scrollSnaps.map((_, index) => (
                    <DotButton key={index} selected={index === selectedIndex} onClick={() => scrollTo(index)} />
                ))}
            </div>
        </>
      )}
    </section>
  );
}
