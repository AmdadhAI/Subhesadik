import { unstable_cache } from 'next/cache';
import { getContent } from './firebase-data';
import { getCategoriesByIds, getProductsByIds } from './firebase-data';
import type { SiteContent, Category, Product } from './types';
import type { SerializedProduct } from '@/types/serialized';

/**
 * Homepage data structure
 * Contains all data needed to render the homepage
 * Products and categories are pre-serialized (Timestamps converted to strings)
 */
export interface HomepageData {
    content: SiteContent;
    topProducts: SerializedProduct[];
    featuredCategories: Omit<Category, 'createdAt'>[];
}

/**
 * Internal function to fetch all homepage data from Firestore
 * This is wrapped by unstable_cache for on-demand revalidation
 * Serializes Timestamps here to prevent cache serialization errors
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

    // Serialize before caching to prevent Timestamp serialization errors
    const serializedProducts: SerializedProduct[] = topProducts.map(p => ({
        ...p,
        createdAt: p.createdAt.toDate().toISOString()
    }));

    const serializedCategories = featuredCategories.map(({ createdAt, ...rest }) => rest);

    return {
        content,
        topProducts: serializedProducts,
        featuredCategories: serializedCategories,
    };
}

/**
 * Get all homepage data with hybrid cache strategy
 * 
 * Cache behavior:
 * - Auto-refreshes every 5 minutes (prevents frozen/stale UI)
 * - Admin updates: revalidateTag('homepage') for instant invalidation
 * - Minimal Firestore reads (only once per 5 min window)
 * - Balance between performance and data freshness
 * 
 * Usage in page.tsx:
 *   const data = await getHomepageData();
 * 
 * Admin invalidation:
 *   revalidateTag('homepage');
 */
export const getHomepageData = unstable_cache(
    fetchHomepageData,
    ['homepage-data'],
    {
        tags: ['homepage'],
        revalidate: 300, // 5 minutes - auto-refresh to prevent frozen UI
    }
);
