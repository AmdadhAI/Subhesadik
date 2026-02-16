'use client'

import type { UseFormReturn } from 'react-hook-form'
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
import { FormField, FormItem, FormLabel, FormMessage, FormControl, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Heart } from 'lucide-react'

interface SectionProps {
    form: UseFormReturn<any>;
}

export function BrandStorySection({ form }: SectionProps) {
    const { control } = form;

    return (
        <AccordionItem value="brand-story">
            <AccordionTrigger>
                <div className="flex items-center gap-3 text-left">
                    <div className="bg-muted p-2 rounded-lg">
                        <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Brand Story Section</h3>
                        <p className="text-sm text-muted-foreground">Showcase your brand values and mission</p>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <Card className="border-none">
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            {/* Headline */}
                            <FormField
                                control={control}
                                name="brandStory.headline"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Headline</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g., Purity in Every Thread & Drop"
                                                className="text-lg font-semibold"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Main title for your brand story section
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Paragraph 1 */}
                            <FormField
                                control={control}
                                name="brandStory.paragraph1"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Paragraph</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Tell your brand story..."
                                                rows={4}
                                                className="resize-none"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Introduce your brand and core values
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Paragraph 2 */}
                            <FormField
                                control={control}
                                name="brandStory.paragraph2"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Second Paragraph</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Expand on your mission and quality..."
                                                rows={4}
                                                className="resize-none"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Elaborate on your commitment and product quality
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* CTA Button Text */}
                            <FormField
                                control={control}
                                name="brandStory.ctaText"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Button Text</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g., Read Our Story"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Call-to-action button label
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* CTA Button Link */}
                            <FormField
                                control={control}
                                name="brandStory.ctaLink"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Button Link</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="/about"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Link destination (e.g., /about, /story, /contact)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="bg-muted/50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    <strong>Note:</strong> The brand story image is managed in the codebase at <code className="bg-background px-1 py-0.5 rounded">/public/brand-story.jpg</code> for optimal performance.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </AccordionContent>
        </AccordionItem>
    );
}
