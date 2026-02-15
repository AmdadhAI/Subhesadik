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
export function FeaturedCategories({ config, categories }: FeaturedCategoriesProps) {
    if (!config || !config.isEnabled || categories.length === 0) {
        return null;
    }

    return (
        <div className="w-full">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <h2 className="text-3xl font-bold font-headline">{config.title}</h2>
                <FeaturedCategoriesCarousel categories={categories} />
            </div>
        </div>
    );
}
