import { getContent } from '@/lib/firebase-data';
import { HeroServerFirstSlide } from './hero-server-first-slide';
import { HeroClientCarousel } from './hero-client-carousel';
import type { HeroSlide } from '@/lib/types';

/**
 * Optimized hero section that renders the first slide server-side
 * This eliminates the 19.3s LCP issue by making the hero image discoverable immediately
 */
export async function HeroOptimized() {
    const content = await getContent();

    // Determine mode
    const isCarouselMode = content.heroMode === 'carousel' && content.heroCarouselSlides && content.heroCarouselSlides.length > 0;

    if (!isCarouselMode) {
        // Single hero mode - server-rendered
        const slide = {
            title: content.heroTitle || 'Welcome to Subhe Sadik',
            subtitle: content.heroSubtitle || 'Discover our collection',
            imageUrl: content.heroImageUrl || 'https://images.unsplash.com/photo-1621856139454-03ff9806204c?q=80&w=1964&auto=format&fit=crop',
            ctaText: content.heroCtaText || 'Shop Now',
            ctaLink: content.heroCtaLink || '/products',
        };

        return <HeroServerFirstSlide slide={slide} />;
    }

    // Carousel mode - server-render first slide, hydrate carousel
    const activeSlides = content.heroCarouselSlides?.filter(s => s.isActive) || [];

    if (activeSlides.length === 0) {
        // Fallback to single mode
        const slide = {
            title: content.heroTitle || 'Welcome to Subhe Sadik',
            subtitle: content.heroSubtitle || 'Discover our collection',
            imageUrl: content.heroImageUrl || 'https://images.unsplash.com/photo-1621856139454-03ff9806204c?q=80&w=1964&auto=format&fit=crop',
            ctaText: content.heroCtaText || 'Shop Now',
            ctaLink: content.heroCtaLink || '/products',
        };
        return <HeroServerFirstSlide slide={slide} />;
    }

    const firstSlide: Omit<HeroSlide, 'id' | 'isActive'> = {
        title: activeSlides[0].title,
        subtitle: activeSlides[0].subtitle,
        imageUrl: activeSlides[0].imageUrl,
        ctaText: activeSlides[0].ctaText,
        ctaLink: activeSlides[0].ctaLink,
    };

    return (
        <>
            {/* Server-rendered first slide for instant LCP */}
            <div className="hero-static">
                <HeroServerFirstSlide slide={firstSlide} />
            </div>

            {/* Client carousel replaces static hero after hydration */}
            <div className="hero-carousel">
                <HeroClientCarousel slides={activeSlides} />
            </div>

            <style jsx>{`
        .hero-carousel {
          display: none;
        }
        
        @media (min-width: 1px) {
          .hero-static {
            display: block;
          }
        }
        
        /* After JS loads, hide static and show carousel */
        :global(.js-loaded) .hero-static {
          display: none;
        }
        
        :global(.js-loaded) .hero-carousel {
          display: block;
        }
      `}</style>

            <script
                dangerouslySetInnerHTML={{
                    __html: `
            if (typeof window !== 'undefined') {
              document.documentElement.classList.add('js-loaded');
            }
          `,
                }}
            />
        </>
    );
}
