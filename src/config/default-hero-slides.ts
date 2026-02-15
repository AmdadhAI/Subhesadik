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
        title: 'Welcome to Subhe Sadik',
        subtitle: 'Discover our premium collection of authentic Islamic products',
        imageUrl: '/hero/default-1.webp',
        ctaText: 'Shop Now',
        ctaLink: '/products',
        isActive: true,
    },
    {
        id: 'default-2',
        title: 'Quality You Can Trust',
        subtitle: 'Handpicked items with verified authenticity',
        imageUrl: '/hero/default-2.webp',
        ctaText: 'View Collections',
        ctaLink: '/collections',
        isActive: true,
    },
    {
        id: 'default-3',
        title: 'Fast & Secure Delivery',
        subtitle: 'Get your orders delivered safely to your doorstep',
        imageUrl: '/hero/default-3.webp',
        ctaText: 'Learn More',
        ctaLink: '/contact',
        isActive: true,
    },
];

/**
 * Get active default hero slides
 */
export function getDefaultHeroSlides(): DefaultHeroSlide[] {
    return DEFAULT_HERO_SLIDES.filter(slide => slide.isActive);
}
