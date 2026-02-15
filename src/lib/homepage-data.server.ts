import { unstable_cache } from 'next/cache';
import { getContent } from './firebase-data';
import { getCategoriesByIds, getProductsByIds } from './firebase-data';
import type { SiteContent, Category, Product } from './types';

/**
 * Homepage data structure
 * Contains all data needed to render the homepage
 */
export interface HomepageData {
    content: SiteContent;
    topProducts: Product[];
    featuredCategories: Category[];
}

/**
 * Internal function to fetch all homepage data from Firestore
 * This is wrapped by unstable_cache for on-demand revalidation
 */
async function fetchHomepageData(): Promise<HomepageData> {
    // Fetch content first to get configuration
    const content = await getContent();

    // Prepare parallel fetches based on configuration
    const fetchPromises: [Promise<Product[]>, Promise<Category[]>] = [
        // Top Products - fetch by IDs from config
        content.topProducts?.isEnabled && content.topProducts.productIds?.length
            ? getProductsByIds(content.topProducts.productIds)
            : Promise.resolve([]),

        // Featured Categories - fetch by IDs from config
        content.featuredCategories?.isEnabled && content.featuredCategories.categoryIds?.length
            ? getCategoriesByIds(content.featuredCategories.categoryIds)
            : Promise.resolve([]),
    ];

    const [topProducts, featuredCategories] = await Promise.all(fetchPromises);

    return {
        content,
        topProducts,
        featuredCategories,
    };
}

/**
 * Get all homepage data with on-demand cache revalidation
 * 
 * Cache behavior:
 * - Cached forever until explicitly invalidated
 * - Invalidate via: revalidateTag('homepage')
 * - Zero Firestore reads after first load
 * - Updates immediately when admin saves content
 * 
 * Usage in page.tsx:
 *   const data = await getHomepageData();
 * 
 * Invalidation in admin actions:
 *   revalidateTag('homepage');
 */
export const getHomepageData = unstable_cache(
    fetchHomepageData,
    ['homepage-data'],
    {
        tags: ['homepage'],
        revalidate: false, // No time-based revalidation - only on-demand
    }
);
