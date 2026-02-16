import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getContent } from '@/lib/firebase-data';

// Default fallback values
const DEFAULT_BRAND_STORY = {
    headline: 'Purity in Every Thread & Drop',
    paragraph1: 'At Subhe Sadik, we believe in the beauty of tradition. From the finest hand-stitched Panjabis to 100% organic Sunnah foods, we bring you quality that nurtures both body and soul.',
    paragraph2: 'Every product is carefully selected to honor the values of authenticity, purity, and excellence. We don\'t just sell products – we share a lifestyle rooted in faith and wellness.',
    ctaText: 'Read Our Story',
    ctaLink: '/about',
};

export async function BrandStory() {
    // Fetch content from Firestore
    const content = await getContent();
    const brandStory = content.brandStory || DEFAULT_BRAND_STORY;

    return (
        <section className="w-full bg-[#F9F7F2] py-12 md:py-20 mt-8 md:mt-12 relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-transparent before:via-primary before:to-transparent">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Split-screen layout: Image left, Text right */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">

                    {/* Left side: Image */}
                    <div className="relative aspect-square md:aspect-[4/5] w-full rounded-lg overflow-hidden shadow-lg">
                        <Image
                            src="/brand-story.jpg"
                            alt="Subhe Sadik lifestyle - Quality Panjabi and Organic Foods"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            quality={85}
                        />
                    </div>

                    {/* Right side: Text content */}
                    <div className="space-y-6 md:py-8">
                        <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                            {brandStory.headline}
                        </h2>

                        <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                            {brandStory.paragraph1}
                        </p>

                        <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                            {brandStory.paragraph2}
                        </p>

                        <div className="pt-4">
                            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white">
                                <Link href={brandStory.ctaLink}>{brandStory.ctaText}</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
