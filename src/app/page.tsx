import { getHomepageData } from "@/lib/homepage-data.server";
import { getDefaultHeroSlides } from "@/config/default-hero-slides";
import type { Product } from "@/lib/types";
import { HeroServerFirstSlide } from "@/components/hero-server-first-slide";
import { HeroCarouselWrapper } from "@/components/hero-carousel-wrapper";
import { TopProducts } from "@/components/top-products";
import { FeaturedCategories } from "@/components/featured-categories";

// Revalidate every 60 seconds (ISR - Incremental Static Regeneration)
// New products will appear in Top Products within 1 minute
export const revalidate = 60;

export default async function Home() {
  // Single cached fetch for ALL homepage data (already serialized)
  const { content, topProducts, featuredCategories } = await getHomepageData();

  // Determine hero mode and prepare data
  const hasAdminCarouselSlides =
    content.heroMode === 'carousel' &&
    content.heroCarouselSlides &&
    content.heroCarouselSlides.length > 0;

  const activeSlides = hasAdminCarouselSlides
    ? content.heroCarouselSlides!.filter((s) => s.isActive)
    : [];

  // Use default slides if no admin slides exist
  const useDefaultSlides = !hasAdminCarouselSlides || activeSlides.length === 0;
  const defaultSlides = useDefaultSlides ? getDefaultHeroSlides() : [];

  // Determine which slides to use
  const finalSlides = useDefaultSlides ? defaultSlides : activeSlides;
  const isCarouselMode = finalSlides.length > 1;

  return (
    <div className="flex flex-col space-y-12">
      {/* Server-rendered hero - always renders first slide immediately */}
      {isCarouselMode ? (
        <>
          {/* Server-rendered first slide for instant LCP */}
          <div data-hero="server">
            <HeroServerFirstSlide
              slide={{
                title: finalSlides[0].title,
                subtitle: finalSlides[0].subtitle,
                imageUrls: finalSlides[0].imageUrls,  // Only exists for admin slides
                imageUrl: finalSlides[0].imageUrl,
                ctaText: finalSlides[0].ctaText,
                ctaLink: finalSlides[0].ctaLink,
              }}
            />
          </div>
          {/* Client carousel (replaces server slide after hydration) */}
          <div data-hero="client" className="hidden">
            <HeroCarouselWrapper slides={finalSlides} />
          </div>
        </>
      ) : (
        <HeroServerFirstSlide
          slide={{
            title: finalSlides[0].title,
            subtitle: finalSlides[0].subtitle,
            imageUrls: finalSlides[0].imageUrls,
            imageUrl: finalSlides[0].imageUrl,
            ctaText: finalSlides[0].ctaText,
            ctaLink: finalSlides[0].ctaLink,
          }}
        />
      )}

      {/* Pass data to components - no internal fetching */}
      <FeaturedCategories
        config={content.featuredCategories}
        categories={featuredCategories}
      />
      <TopProducts
        config={content.topProducts}
        products={topProducts}
      />
    </div>
  );
}
