'use client'

import type { UseFormReturn } from 'react-hook-form'
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent } from '@/components/ui/card'
import { FormField, FormItem, FormLabel, FormMessage, FormDescription, FormControl } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Megaphone } from 'lucide-react'

interface SectionProps {
  form: UseFormReturn<any>;
}

export function CommunicationNoticesSection({ form }: SectionProps) {
    const { control } = form;
    return (
        <AccordionItem value="communication-notices">
        <AccordionTrigger>
            <div className="flex items-center gap-3 text-left">
                <div className="bg-muted p-2 rounded-lg">
                    <Megaphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold">Communication & Notices</h3>
                    <p className="text-sm text-muted-foreground">Manage site-wide banners and messaging.</p>
                </div>
            </div>
        </AccordionTrigger>
        <AccordionContent>
            <Card className="border-none">
                <CardContent className="pt-6 space-y-8">
                     <FormField
                        control={control}
                        name="noticeBanner"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Site-wide Notice Banner Text</FormLabel>
                            <FormControl>
                                <Input placeholder="E.g., Free shipping on all orders over ৳2000!" {...field} value={field.value || ''}/>
                            </FormControl>
                            <FormDescription>
                                This text will appear at the very top of your website. Leave it blank to hide the banner.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="checkoutNotice"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Checkout Notice</FormLabel>
                            <FormControl>
                            <Textarea
                                rows={3}
                                placeholder="E.g., Due to high demand, shipping may be delayed."
                                {...field}
                            />
                            </FormControl>
                            <FormDescription>This text will appear on the checkout page.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="contact.productChatHelperText"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Product Page Chat Helper Text</FormLabel>
                            <FormControl>
                                <Input placeholder="Need help before buying?" {...field} value={field.value || ''} />
                            </FormControl>
                             <FormDescription>This text appears above the chat buttons on the product page.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
        </AccordionContent>
        </AccordionItem>
    )
}
