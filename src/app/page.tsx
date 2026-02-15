import { getHomepageData } from "@/lib/homepage-data.server";
import type { Product } from "@/lib/types";
import { HeroServerFirstSlide } from "@/components/hero-server-first-slide";
import { HeroCarouselWrapper } from "@/components/hero-carousel-wrapper";
import { TopProducts } from "@/components/top-products";
import { FeaturedCategories } from "@/components/featured-categories";

// No time-based ISR - using on-demand revalidation via cache tags
// Homepage data cached forever until admin updates (revalidateTag('homepage'))
// Zero Firestore reads after first load

export default async function Home() {
  // Single cached fetch for ALL homepage data (already serialized)
  const { content, topProducts, featuredCategories } = await getHomepageData();

  // Determine hero mode and prepare data
  const isCarouselMode =
    content.heroMode === 'carousel' &&
    content.heroCarouselSlides &&
    content.heroCarouselSlides.length > 0;

  const activeSlides = isCarouselMode
    ? content.heroCarouselSlides!.filter((s) => s.isActive)
    : [];

  // Prepare single slide data for fallback
  const singleSlide = {
    title: content.heroTitle || 'Welcome to Subhe Sadik',
    subtitle: content.heroSubtitle || 'Discover our collection',
    imageUrls: content.heroImageUrls,  // New: responsive URLs
    imageUrl: content.heroImageUrl || '/hero/default-1.webp',  // Static fallback
    ctaText: content.heroCtaText || 'Shop Now',
    ctaLink: content.heroCtaLink || '/products',
  };

  return (
    <div className="flex flex-col space-y-12">
      {/* Server-rendered hero - always renders first slide immediately */}
      {isCarouselMode && activeSlides.length > 0 ? (
        <>
          {/* Server-rendered first slide for instant LCP */}
          <div data-hero="server">
            <HeroServerFirstSlide
              slide={{
                title: activeSlides[0].title,
                subtitle: activeSlides[0].subtitle,
                imageUrls: activeSlides[0].imageUrls,  // Pass responsive URLs
                imageUrl: activeSlides[0].imageUrl,    // Fallback
                ctaText: activeSlides[0].ctaText,
                ctaLink: activeSlides[0].ctaLink,
              }}
            />
          </div>
          {/* Client carousel (replaces server slide after hydration) */}
          <div data-hero="client" className="hidden">
            <HeroCarouselWrapper slides={activeSlides} />
          </div>
        </>
      ) : (
        <HeroServerFirstSlide slide={singleSlide} />
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
