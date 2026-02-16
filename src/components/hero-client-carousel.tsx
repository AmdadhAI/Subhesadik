'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';
import type { HeroSlide } from '@/lib/types';
import { cn } from '@/lib/utils';

interface HeroClientCarouselProps {
    slides: HeroSlide[];
}

const DotButton: React.FC<{ selected: boolean; onClick: () => void }> = ({ selected, onClick }) => (
    <button
        className={cn(
            "h-6 w-6 flex items-center justify-center transition-all duration-300 p-0", // Reduced click target size, removed padding
            "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )}
        type="button"
        onClick={onClick}
        aria-label="Go to slide"
    >
        <span
            className={cn(
                "h-2 w-2 rounded-full transition-colors duration-300", // Smaller dot
                selected ? 'bg-primary' : 'bg-white/50'
            )}
        />
    </button>
);

/**
 * Client-side carousel that hydrates after mount
 * Replaces the static server-rendered first slide
 */
export function HeroClientCarousel({ slides }: HeroClientCarouselProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: true })]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
    const [displayedSlide, setDisplayedSlide] = useState<HeroSlide>(slides[0]);
    const [isTextAnimatingOut, setIsTextAnimatingOut] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

    const onInit = useCallback((emblaApi: UseEmblaCarouselType[1]) => {
        if (!emblaApi) return;
        setScrollSnaps(emblaApi.scrollSnapList());
    }, []);

    const onSelect = useCallback((emblaApi: UseEmblaCarouselType[1]) => {
        if (!emblaApi) return;
        const newIndex = emblaApi.selectedScrollSnap();

        setIsTextAnimatingOut(true);

        setTimeout(() => {
            setDisplayedSlide(slides[newIndex]);
            setIsTextAnimatingOut(false);
            setSelectedIndex(newIndex);
        }, 200);
    }, [slides]);

    useEffect(() => {
        if (!emblaApi) return;
        onInit(emblaApi);
        emblaApi.on('reInit', onInit);
        emblaApi.on('select', onSelect);
        return () => {
            if (emblaApi) {
                emblaApi.off('reInit', onInit);
                emblaApi.off('select', onSelect);
            }
        };
    }, [emblaApi, onInit, onSelect]);

    // Don't render until mounted to avoid hydration mismatch
    if (!isMounted) {
        return null;
    }

    return (
        <section
            className="relative w-full aspect-square md:aspect-auto md:h-[100svh] overflow-hidden bg-muted"
        >
            {/* Background Image Carousel - Fixed height container */}
            <div className="absolute inset-0 z-0" ref={emblaRef}>
                <div className="flex h-full">
                    {slides.map((slide, index) => {
                        const imageSrc = slide.imageUrls?.lg || slide.imageUrl || '';
                        const hasSrcSet = !!slide.imageUrls;

                        return (
                            <div className="relative flex-[0_0_100%] h-full" key={slide.id}>
                                <Image
                                    src={imageSrc}
                                    alt={slide.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 1024px, 1920px"
                                    {...(hasSrcSet && {
                                        srcSet: `
                                            ${slide.imageUrls!.sm} 640w,
                                            ${slide.imageUrls!.md} 1024w,
                                            ${slide.imageUrls!.lg} 1920w
                                        `
                                    })}
                                    className="object-cover"
                                    quality={85}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none" />

            {/* Foreground Text Content - Fixed height container */}
            {displayedSlide && (
                <div
                    className={cn(
                        "relative z-20 h-full flex flex-col items-center justify-center text-center text-white px-4 pointer-events-none",
                        "motion-reduce:animate-none",
                        isTextAnimatingOut
                            ? 'animate-hero-text-out'
                            : 'animate-hero-text-in'
                    )}
                >
                    <div className="max-w-4xl space-y-4 md:space-y-6">
                        <h1
                            className="font-headline text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight drop-shadow-lg"
                        >
                            {displayedSlide.title}
                        </h1>

                        <p className="hidden md:block text-base md:text-xl lg:text-2xl drop-shadow-md max-w-2xl mx-auto">
                            {displayedSlide.subtitle}
                        </p>

                        <div className="pt-2">
                            <Button
                                asChild
                                size="lg"
                                className="pointer-events-auto min-h-[48px] px-8"
                            >
                                <Link href={displayedSlide.ctaLink}>{displayedSlide.ctaText}</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Dots - Tightest spacing */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 flex gap-0 pb-0">
                {scrollSnaps.map((_, index) => (
                    <DotButton key={index} selected={index === selectedIndex} onClick={() => scrollTo(index)} />
                ))}
            </div>
        </section>
    );
}
