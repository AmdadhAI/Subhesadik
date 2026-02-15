'use client';

import { useEffect, useState } from 'react';
import { getContent } from '@/lib/firebase-data';
import type { ColorTheme } from '@/lib/types';

/**
 * Client-side theme provider that reads theme from Firestore and applies it immediately
 * This fixes the issue where theme changes weren't reflecting due to server-side caching
 */
export function ThemeProvider({ children, initialTheme }: { children: React.ReactNode; initialTheme: ColorTheme }) {
    const [theme, setTheme] = useState<ColorTheme>(initialTheme);

    useEffect(() => {
        // Fetch theme from Firestore on client-side to bypass Next.js caching
        const fetchTheme = async () => {
            try {
                const content = await getContent();
                const newTheme = content.colorTheme || 'green-honey';
                if (newTheme !== theme) {
                    setTheme(newTheme);
                    // Update the data-theme attribute on the html element
                    document.documentElement.setAttribute('data-theme', newTheme);
                }
            } catch (error) {
                console.error('Failed to fetch theme:', error);
            }
        };

        fetchTheme();

        // Poll for theme changes every 5 seconds when on admin pages
        const isAdminPage = window.location.pathname.startsWith('/admin');
        if (isAdminPage) {
            const interval = setInterval(fetchTheme, 5000);
            return () => clearInterval(interval);
        }
    }, [theme]);

    return <>{children}</>;
}
