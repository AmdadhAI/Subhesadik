/**
 * Default Hero Slides Configuration
 * 
 * These are fallback hero slides used when no custom slides are uploaded via admin.
 * All images are stored in /public/hero/ and deployed with the build.
 * 
 * To add/edit default slides:
 * 1. Add image to /public/hero/ (e.g., default-1.webp)
 * 2. Add configuration below
 * 3. Commit to git
 * 4. Deploy
 */

export interface DefaultHeroSlide {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;  // Path to image in /public
    imageUrls?: {      // Optional responsive URLs (for admin-uploaded processed images)
        sm: string;
        md: string;
        lg: string;
    };
    ctaText: string;
    ctaLink: string;
    isActive: boolean;
}

/**
 * Default hero slides shown when admin hasn't uploaded custom slides
 * These are version-controlled and deployed with the app
 */
export const DEFAULT_HERO_SLIDES: DefaultHeroSlide[] = [
    {
        id: 'default-1',
        title: 'Subhe Sadik',
        subtitle: 'Pure, Natural & Trusted Food for Everyday Wellness',
        imageUrl: '/hero/default-1.webp',
        ctaText: 'Shop Now',
        ctaLink: '/products',
        isActive: true,
    },
    {
        id: 'default-2',
        title: 'Timeless Panjabi Collection',
        subtitle: 'Discover elegance and tradition in our masterfully crafted attire',
        imageUrl: '/hero/default-2.webp',
        ctaText: 'Explore Panjabi',
        ctaLink: '/collections/panjabi',
        isActive: true,
    },
    {
        id: 'default-3',
        title: 'Pure & Natural Organic Foods',
        subtitle: 'Taste the difference of nature\'s best, delivered to your door',
        imageUrl: '/hero/default-3.webp',
        ctaText: 'Shop Organics',
        ctaLink: '/collections/organic-food',
        isActive: true,
    },
    {
        id: 'default-4',
        title: 'Exquisite Attars & Perfumes',
        subtitle: 'Unveil captivating scents that define your presence',
        imageUrl: '/hero/default-4.webp',
        ctaText: 'Find Your Scent',
        ctaLink: '/collections/perfume',
        isActive: true,
    },
];

/**
 * Get active default hero slides
 */
export function getDefaultHeroSlides(): DefaultHeroSlide[] {
    return DEFAULT_HERO_SLIDES.filter(slide => slide.isActive);
}
