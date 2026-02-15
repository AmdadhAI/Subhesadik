'use client';

import { useEffect, useState } from 'react';
import { HeroClientCarousel } from './hero-client-carousel';
import type { HeroSlide } from '@/lib/types';

interface HeroCarouselWrapperProps {
    slides: HeroSlide[];
}

/**
 * Client component that shows carousel after hydration
 * Prevents hydration mismatch by mounting after client-side render
 */
export function HeroCarouselWrapper({ slides }: HeroCarouselWrapperProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Hide the server-rendered first slide and show carousel
        const serverHero = document.querySelector('[data-hero="server"]');
        const clientHero = document.querySelector('[data-hero="client"]');

        if (serverHero && clientHero) {
            serverHero.classList.add('hidden');
            clientHero.classList.remove('hidden');
        }

        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return <HeroClientCarousel slides={slides} />;
}
