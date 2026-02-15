import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { HeroSlide } from '@/lib/types';

interface HeroServerFirstSlideProps {
    slide: Omit<HeroSlide, 'id' | 'isActive'>;
}

/**
 * Server-rendered first hero slide to eliminate LCP issues
 * This component renders immediately in the HTML without JS
 * Supports responsive images (3 sizes) for optimal loading
 */
export function HeroServerFirstSlide({ slide }: HeroServerFirstSlideProps) {
    // Use responsive URLs if available, otherwise fallback to single URL
    const imageSrc = slide.imageUrls?.lg || slide.imageUrl || '';
    const hasSrcSet = !!slide.imageUrls;

    return (
        <section
            className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden bg-muted"
            style={{ minHeight: '500px', maxHeight: '900px' }}
        >
            {/* Priority image - loaded immediately with responsive sizes */}
            <Image
                src={imageSrc}
                alt={slide.title}
                fill
                priority
                fetchPriority="high"
                sizes="100vw"
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

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none" />

            {/* Text content with fixed height container to prevent CLS */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4 pointer-events-none">
                <div className="max-w-4xl space-y-4 md:space-y-6">
                    {/* Fixed height for title to prevent layout shift */}
                    <h1
                        className="font-headline text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight drop-shadow-lg"
                        style={{ minHeight: '2.5rem' }}
                    >
                        {slide.title}
                    </h1>

                    {/* Fixed height for subtitle */}
                    <p
                        className="text-base md:text-xl lg:text-2xl drop-shadow-md max-w-2xl mx-auto"
                        style={{ minHeight: '1.5rem' }}
                    >
                        {slide.subtitle}
                    </p>

                    {/* CTA button with fixed dimensions */}
                    <div className="pt-2">
                        <Button
                            asChild
                            size="lg"
                            className="pointer-events-auto min-h-[48px] px-8"
                        >
                            <Link href={slide.ctaLink}>{slide.ctaText}</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
