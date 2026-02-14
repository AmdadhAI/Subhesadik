'use client'

import type { UseFormReturn } from 'react-hook-form'
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent } from '@/components/ui/card'
import { FormField, FormItem, FormLabel, FormMessage, FormDescription, FormControl } from '@/components/ui/form'
import { ImageUploader } from '@/components/admin/image-uploader'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { CheckCircle, Palette } from 'lucide-react'

interface SectionProps {
  form: UseFormReturn<any>;
}

const themes: { id: string, name: string, colors: { primary: string, accent: string, background: string } }[] = [
    { id: 'green-honey', name: 'Green & Honey', colors: { primary: '#1F7A4D', accent: '#F4A62A', background: '#FAFAF7' } },
    { id: 'indigo-gold', name: 'Indigo & Gold', colors: { primary: '#312E81', accent: '#D4AF37', background: '#F9FAFB' } },
    { id: 'earth-olive', name: 'Earth Brown & Olive', colors: { primary: '#6B4226', accent: '#8A9A5B', background: '#FBF7F2' } },
    { id: 'charcoal-green', name: 'Charcoal & Green', colors: { primary: '#111827', accent: '#22C55E', background: '#FFFFFF' } },
    { id: 'sun-green', name: 'Sun & Green', colors: { primary: '#F59E0B', accent: '#16A34A', background: '#FFFBF5' } },
];

export function BrandingAppearanceSection({ form }: SectionProps) {
  return (
    <AccordionItem value="branding-appearance">
      <AccordionTrigger>
        <div className="flex items-center gap-3 text-left">
          <div className="bg-muted p-2 rounded-lg">
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Branding & Appearance</h3>
            <p className="text-sm text-muted-foreground">Manage your site's logo and color theme.</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <Card className="border-none">
          <CardContent className="pt-6 space-y-8">
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Logo</FormLabel>
                  <FormControl>
                    <ImageUploader 
                      uploadPath="site"
                      onUrlChange={field.onChange}
                      currentUrl={field.value || ''}
                      formFieldName="logoUrl"
                    />
                  </FormControl>
                  <FormDescription>
                    Upload or paste a URL for your site logo. Recommended height: 40px.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="colorTheme"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                    <FormLabel>Color Theme</FormLabel>
                    <FormDescription>Select a color palette for your customer-facing website.</FormDescription>
                    <FormControl>
                        <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                        {themes.map((theme) => {
                            const themeId = `theme-${theme.id}`;
                            return (
                            <FormItem key={theme.id}>
                                <Label
                                    htmlFor={themeId}
                                    className={cn(
                                        "relative flex flex-col items-center justify-between rounded-lg border-2 border-input bg-transparent p-4 cursor-pointer transition-all duration-200 hover:bg-accent/50",
                                        field.value === theme.id && "border-primary bg-primary/5"
                                    )}
                                >
                                    <FormControl>
                                        <RadioGroupItem value={theme.id} id={themeId} className="sr-only" />
                                    </FormControl>
                                    {field.value === theme.id && (
                                        <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-primary" />
                                    )}
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="flex-1 space-y-2">
                                            <div className="h-8 rounded" style={{ backgroundColor: theme.colors.primary }} />
                                            <div className="flex gap-2">
                                                <div className="h-6 flex-1 rounded" style={{ backgroundColor: theme.colors.accent }} />
                                                <div className="h-6 flex-1 rounded" style={{ backgroundColor: theme.colors.background, border: '1px solid #ccc' }} />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-base mt-3 text-center">{theme.name}</p>
                                </Label>
                            </FormItem>
                            );
                        })}
                        </RadioGroup>
                    </FormControl>
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
