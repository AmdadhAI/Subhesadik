import { getContent } from '@/lib/firebase-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MapPin, Phone } from 'lucide-react';

export default async function ContactPage() {
    const content = await getContent();

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-4xl">Contact Us</CardTitle>
                        <p className="text-muted-foreground">We'd love to hear from you. Here's how you can reach us.</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                               <MapPin className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Our Address</h3>
                                <p className="text-muted-foreground">{content.contact.address}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                               <Mail className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Email Us</h3>
                                <p className="text-muted-foreground">{content.contact.email}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                               <Phone className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Call Us</h3>
                                <p className="text-muted-foreground">{content.contact.phone}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
