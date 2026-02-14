import { getContent, getCategoriesByIds } from "@/lib/firebase-data";
import { FeaturedCategoriesCarousel } from "./featured-categories-carousel";
import type { Category } from "@/lib/types";

export async function FeaturedCategories() {
    const content = await getContent();
    const config = content.featuredCategories;

    if (!config || !config.isEnabled || !config.categoryIds?.length) {
        return null;
    }

    const categories = await getCategoriesByIds(config.categoryIds);

    if (categories.length === 0) {
        return null;
    }

    // Timestamps are not serializable, so we can't pass them to client components directly.
    // However, for this component, we don't need the timestamp, so we can just pass the rest of the data.
    const serializableCategories = categories.map(category => {
      const { createdAt, ...rest } = category;
      return rest;
    }) as Omit<Category, 'createdAt'>[];


    return (
        <div className="w-full">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <h2 className="text-3xl font-bold font-headline">{config.title}</h2>
                <FeaturedCategoriesCarousel categories={serializableCategories} />
            </div>
        </div>
    );
}
