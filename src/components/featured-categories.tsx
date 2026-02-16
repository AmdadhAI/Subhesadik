import { FeaturedCategoriesCarousel } from "./featured-categories-carousel";
import type { Category, FeaturedCategoriesConfig } from "@/lib/types";

interface FeaturedCategoriesProps {
    config?: FeaturedCategoriesConfig;
    categories: Omit<Category, 'createdAt'>[];
}

/**
 * FeaturedCategories component - receives data as props
 * No internal Firestore fetching - all data from getHomepageData()
 */
import { STATIC_CATEGORIES } from "@/config/categories";

export function FeaturedCategories({ config }: FeaturedCategoriesProps) {
    // Dynamic check only for config enabled/disabled
    if (!config || !config.isEnabled) {
        return null;
    }

    // Use STATIC_CATEGORIES instead of passed props
    // This bypasses the database fetch latency for images
    return (
        <div className="w-full">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <h2 className="text-3xl font-bold font-headline">{config.title}</h2>
                <FeaturedCategoriesCarousel categories={STATIC_CATEGORIES} />
            </div>
        </div>
    );
}
