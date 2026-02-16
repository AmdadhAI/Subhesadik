'use client'

import type { UseFormReturn } from 'react-hook-form'
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent } from '@/components/ui/card'
import { FormField, FormItem, FormLabel, FormMessage, FormDescription, FormControl } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Info } from 'lucide-react'
import { Separator } from '@/components/ui/separator';
import { ImageUploader } from '../image-uploader';

interface SectionProps {
    form: UseFormReturn<any>;
}

export function AboutContactSection({ form }: SectionProps) {
    const { control } = form;
    return (
        <AccordionItem value="about-contact">
            <AccordionTrigger>
                <div className="flex items-center gap-3 text-left">
                    <div className="bg-muted p-2 rounded-lg">
                        <Info className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold">About & Contact Information</h3>
                        <p className="text-sm text-muted-foreground">Edit your About Us page, contact details, and social links.</p>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <Card className="border-none">
                    <CardContent className="pt-6 space-y-8">
                        <FormField
                            control={control}
                            name="aboutUs"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg font-semibold">About Us</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            rows={8}
                                            placeholder="Write a short description about your business..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Separator />
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Contact Information</h3>
                            <div className="grid sm:grid-cols-1 gap-4">
                                <FormField
                                    control={control}
                                    name="contact.address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="123 Main St, Anytown" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <FormField
                                    control={control}
                                    name="contact.email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="contact@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="contact.phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number (for direct calls)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+8801234567890" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator className="my-4" />
                            <h4 className="font-semibold text-base">Social Media</h4>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <FormField
                                    control={control}
                                    name="contact.whatsappNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>WhatsApp Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., 8801234567890" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormDescription>Include country code without the '+'.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="contact.messengerUsername"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Messenger Username</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., subhesadik" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormDescription>Your Facebook Page username/ID.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid sm:grid-cols-1 gap-4">
                                <FormField
                                    control={control}
                                    name="contact.facebookUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Facebook Page URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://www.facebook.com/subhesadik4747" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormDescription>Full URL to your Facebook page</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator className="my-4" />
                            <h4 className="font-semibold text-base">Custom Social Icons (Optional)</h4>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <FormField
                                    control={control}
                                    name="contact.whatsappIconUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>WhatsApp Icon (Optional)</FormLabel>
                                            <FormControl>
                                                <ImageUploader
                                                    uploadPath="site"
                                                    onUrlChange={field.onChange}
                                                    currentUrl={field.value || ''}
                                                    formFieldName="contact.whatsappIconUrl"
                                                />
                                            </FormControl>
                                            <FormDescription>Upload a custom icon for the WhatsApp button.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="contact.messengerIconUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Messenger Icon (Optional)</FormLabel>
                                            <FormControl>
                                                <ImageUploader
                                                    uploadPath="site"
                                                    onUrlChange={field.onChange}
                                                    currentUrl={field.value || ''}
                                                    formFieldName="contact.messengerIconUrl"
                                                />
                                            </FormControl>
                                            <FormDescription>Upload a custom icon for the Messenger button.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </AccordionContent>
        </AccordionItem>
    )
}
