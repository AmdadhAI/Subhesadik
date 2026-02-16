import { ProductCard } from "./product-card";
import type { SerializedProduct } from "@/types/serialized";
import type { TopProductsConfig } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TopProductsProps {
    config?: TopProductsConfig;
    products: SerializedProduct[];
}

/**
 * TopProducts component - receives data as props
 * No internal Firestore fetching - all data from getHomepageData()
 */
export function TopProducts({ config, products }: TopProductsProps) {
    if (!config || !config.isEnabled || products.length === 0) {
        return null;
    }

    return (
        <div className="w-full py-4 md:py-6">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                {/* Centered section title with decorative borders */}
                <div className="flex items-center justify-center gap-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-primary to-primary flex-1 max-w-32"></div>
                    <h2 className="text-2xl md:text-3xl font-bold font-headline text-center px-4 border-2 border-primary rounded-lg py-2">
                        {config.title}
                    </h2>
                    <div className="h-px bg-gradient-to-l from-transparent via-primary to-primary flex-1 max-w-32"></div>
                </div>

                {/* Mobile: 2x2 grid, Desktop: 4 columns grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {products.map((product, index) => (
                        <ProductCard key={product.id} product={product} priority={index < 4} />
                    ))}
                </div>

                {/* Explore All Products Button */}
                <div className="flex justify-center pt-4">
                    <Button asChild size="lg" className="min-w-[200px]">
                        <Link href="/products">Explore All Products</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
