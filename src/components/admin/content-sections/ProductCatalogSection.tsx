'use client'

import type { UseFormReturn } from 'react-hook-form'
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent } from '@/components/ui/card'
import { FormField, FormItem, FormLabel, FormMessage, FormDescription, FormControl } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Package } from 'lucide-react'

interface SectionProps {
  form: UseFormReturn<any>;
}

export function ProductCatalogSection({ form }: SectionProps) {
    const { control } = form;
    return (
        <AccordionItem value="product-catalog-settings">
        <AccordionTrigger>
            <div className="flex items-center gap-3 text-left">
                <div className="bg-muted p-2 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold">Product & Catalog Settings</h3>
                    <p className="text-sm text-muted-foreground">Global settings for your product pages and catalog.</p>
                </div>
            </div>
        </AccordionTrigger>
        <AccordionContent>
            <Card className="border-none">
            <CardContent className="pt-6 space-y-8">
                <Card className="p-4 bg-muted/30">
                    <div className="space-y-4">
                        <FormField
                            control={control}
                            name="productPageOptions.showQuickContact"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                                <div className="space-y-0.5">
                                    <FormLabel>Show Quick Contact Bar</FormLabel>
                                    <FormDescription>Display a WhatsApp/Messenger contact bar on product pages.</FormDescription>
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="productPageOptions.whatsappInquiryMessage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>WhatsApp Message Template</FormLabel>
                                    <FormControl><Textarea placeholder="Hello, I'm interested in..." {...field} value={field.value || ''}/></FormControl>
                                    <FormDescription>Use {'{{productName}}'} and {'{{productUrl}}'} as placeholders.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </Card>
            </CardContent>
            </Card>
        </AccordionContent>
        </AccordionItem>
    )
}
