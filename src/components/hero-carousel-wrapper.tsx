'use client';

import { useEffect, useState } from 'react';
import { HeroClientCarousel } from './hero-client-carousel';
import type { HeroSlide } from '@/lib/types';

interface HeroCarouselWrapperProps {
    slides: HeroSlide[];
}

/**
 * Hydration-safe carousel wrapper
 * Keeps server-rendered slide visible until client is ready
 * Prevents layout shift and duplicate image loads
 */
export function HeroCarouselWrapper({ slides }: HeroCarouselWrapperProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Wait for client-side mount
        setMounted(true);

        // After mount, hide server hero and show client carousel
        // Use setTimeout to ensure smooth transition after paint
        const timer = setTimeout(() => {
            const serverHero = document.querySelector('[data-hero="server"]');
            const clientHero = document.querySelector('[data-hero="client"]');

            if (serverHero && clientHero) {
                // Remove server slide (prevents duplicate images)
                serverHero.remove();
                // Show client carousel
                clientHero.classList.remove('hidden');
            }
        }, 100); // Small delay ensures first paint is complete

        return () => clearTimeout(timer);
    }, []);

    // Don't render carousel until mounted (prevents hydration mismatch)
    if (!mounted) {
        return null;
    }

    // Return carousel (will be hidden by CSS until server slide is removed)
    return <HeroClientCarousel slides={slides} />;
}
