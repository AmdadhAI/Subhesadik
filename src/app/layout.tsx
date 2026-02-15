import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { BottomNav } from '@/components/layout/bottom-nav';
import PageTransitionWrapper from '@/components/page-transition-wrapper';
import { NoticeBanner } from '@/components/layout/notice-banner';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { getContent } from '@/lib/firebase-data';
import type { ColorTheme } from '@/lib/types';
import { ThemeProvider } from '@/components/theme-provider';

// Load fonts with next/font for Zero CLS
const ptSans = PT_Sans({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pt-sans'
});

export const metadata: Metadata = {
  title: 'Subhe Sadik eCommerce',
  description: 'A minimal and modern eCommerce platform.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getContent();
  const theme: ColorTheme = content.colorTheme || 'green-honey';

  // Get first hero image for preloading to improve LCP
  let heroImageUrl = '';
  if (content.heroMode === 'carousel' && content.heroCarouselSlides && content.heroCarouselSlides.length > 0) {
    const firstActiveSlide = content.heroCarouselSlides.find(s => s.isActive);
    heroImageUrl = firstActiveSlide?.imageUrls?.lg || firstActiveSlide?.imageUrl || '';
  } else {
    heroImageUrl = content.heroImageUrls?.lg || content.heroImageUrl || '';
  }

  return (
    <html lang="en" className={ptSans.variable} data-theme={theme} suppressHydrationWarning>
      <head>
        {heroImageUrl && (
          <link
            rel="preload"
            as="image"
            href={heroImageUrl}
            // @ts-ignore - fetchpriority is valid but not in types yet
            fetchpriority="high"
          />
        )}
      </head>
      <body className={`${ptSans.className} antialiased`} suppressHydrationWarning>
        <FirebaseClientProvider>
          <ThemeProvider initialTheme={theme}>
            <div className="flex flex-col min-h-screen">
              <NoticeBanner />
              <Header />
              <main className="flex-grow">
                <PageTransitionWrapper>{children}</PageTransitionWrapper>
              </main>
              <Footer />
            </div>
            <BottomNav />
            <CartDrawer />
            <Toaster />
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

