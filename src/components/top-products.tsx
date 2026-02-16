import { ProductCard } from "./product-card";
import type { SerializedProduct } from "@/types/serialized";
import type { TopProductsConfig } from "@/lib/types";

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
        <div className="w-full">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold font-headline mb-6">{config.title}</h2>
            </div>
            <div className="pl-4 sm:pl-6 lg:pl-8">
                <div className="flex overflow-x-auto pb-6 -mb-6 gap-4">
                    {products.map((product, index) => (
                        <div key={product.id} className="w-[45vw] sm:w-64 flex-shrink-0">
                            <ProductCard product={product} priority={index < 4} />
                        </div>
                    ))}
                    {/* Add a spacer to the end */}
                    <div className="w-1 h-1 flex-shrink-0" />
                </div>
            </div>
        </div>
    );
}
