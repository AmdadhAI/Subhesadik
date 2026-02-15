import { getProducts } from "@/lib/firebase-data";
import { getContent } from "@/lib/firebase-data-cached"; // On-demand cache with tags
import type { Product } from "@/lib/types";
import { HeroServerFirstSlide } from "@/components/hero-server-first-slide";
import { HeroCarouselWrapper } from "@/components/hero-carousel-wrapper";
import { TopProducts } from "@/components/top-products";
import { FeaturedCategories } from "@/components/featured-categories";

// No time-based ISR - using on-demand revalidation via cache tags
// Cache invalidates only when admin saves content (revalidateTag('homepage-content'))

export default async function Home() {
  let featuredProducts: Product[] = [];
  let error: string | null = null;

  // Fetch products and content in parallel
  const [allProducts, content] = await Promise.all([
    getProducts(),
    getContent(),
  ]);

  try {
    const shuffled = allProducts.sort(() => 0.5 - Math.random());
    featuredProducts = shuffled.slice(0, 4);
  } catch (e: any) {
    console.error("Failed to fetch products:", e);
    error = "There was an issue loading products. Please try again later.";
  }

  const serializableProducts = featuredProducts.map((product) => ({
    ...product,
    createdAt: product.createdAt.toDate().toISOString(),
  }));

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
    imageUrl:
      content.heroImageUrl ||
      'https://images.unsplash.com/photo-1621856139454-03ff9806204c?q=80&w=1964&auto=format&fit=crop',
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

      <FeaturedCategories />
      <TopProducts />
    </div>
  );
}
