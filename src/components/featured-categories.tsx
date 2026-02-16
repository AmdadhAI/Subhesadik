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
        <div className="w-full pt-6 pb-4 md:pt-8 md:pb-6">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                {/* Centered section title with decorative borders */}
                <div className="flex items-center justify-center gap-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-primary to-primary flex-1 max-w-32"></div>
                    <h2 className="text-2xl md:text-3xl font-bold font-headline text-center px-4 border-2 border-primary rounded-lg py-2">
                        {config.title}
                    </h2>
                    <div className="h-px bg-gradient-to-l from-transparent via-primary to-primary flex-1 max-w-32"></div>
                </div>
                <FeaturedCategoriesCarousel categories={STATIC_CATEGORIES} />
            </div>
        </div>
    );
}
