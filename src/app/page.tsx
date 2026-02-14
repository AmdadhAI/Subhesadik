
import { getProducts } from "@/lib/firebase-data";
import type { Product } from "@/lib/types";
import { HeroCarousel } from "@/components/hero-carousel";
import { TopProducts } from "@/components/top-products";
import { FeaturedCategories } from "@/components/featured-categories";


export default async function Home() {
  let featuredProducts: Product[] = [];
  let error: string | null = null;

  // Fetch products
  const allProducts = await getProducts();

  try {
    const shuffled = allProducts.sort(() => 0.5 - Math.random());
    featuredProducts = shuffled.slice(0, 4);
  } catch (e: any)
{
    console.error("Failed to fetch products:", e);
    error = "There was an issue loading products. Please try again later.";
  }
  
  const serializableProducts = featuredProducts.map(product => ({
      ...product,
      createdAt: product.createdAt.toDate().toISOString(),
  }));

  return (
    <div className="flex flex-col space-y-12">
      <HeroCarousel />
      <FeaturedCategories />
      <TopProducts />
    </div>
  );
}
