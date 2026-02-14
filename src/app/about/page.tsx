import { getContent } from '@/lib/firebase-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AboutPage() {
    const content = await getContent();

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-4xl">About Us</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg text-muted-foreground whitespace-pre-wrap">
                            {content.aboutUs}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
