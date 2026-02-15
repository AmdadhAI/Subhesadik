import { unstable_cache } from 'next/cache';
import { getContent as getContentOriginal } from './firebase-data';

/**
 * Cached version of getContent using on-demand revalidation
 * Cache is invalidated only when admin updates content via revalidateTag('homepage-content')
 * Reduces Firestore reads from 1,440/day (time-based ISR) to near-zero
 */
export const getContent = unstable_cache(
    getContentOriginal,
    ['homepage-content'], // Cache key
    {
        tags: ['homepage-content'], // Revalidation tag
        revalidate: false // No time-based revalidation - only on-demand
    }
);
