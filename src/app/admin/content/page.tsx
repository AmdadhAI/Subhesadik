'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/hooks/use-toast'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect, useState } from 'react'
import { getContent } from '@/lib/firebase-data'
import { useFirestore } from '@/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { Accordion } from '@/components/ui/accordion'
import {
  BrandingAppearanceSection,
  HomepageContentSection,
  ProductCatalogSection,
  CommunicationNoticesSection,
  AboutContactSection,
  AdvancedSection,
} from '@/components/admin/content-sections'
import { Save, X } from 'lucide-react'
import { revalidateApp } from '../actions'


const slideSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required.'),
  subtitle: z.string().min(1, 'Subtitle is required.'),
  imageUrl: z.string().url('Must be a valid URL.'),
  ctaText: z.string().min(1, 'CTA text is required.'),
  ctaLink: z.string().min(1, 'CTA link is required.'),
  isActive: z.boolean(),
});

const topProductsSchema = z.object({
  isEnabled: z.boolean(),
  title: z.string().min(1, 'Title is required.'),
  productIds: z.array(z.string()).optional(),
});

const featuredCategoriesSchema = z.object({
  isEnabled: z.boolean(),
  title: z.string().min(1, 'Title is required.'),
  categoryIds: z.array(z.string()).optional(),
});

const productPageOptionsSchema = z.object({
  showQuickContact: z.boolean(),
  whatsappInquiryMessage: z.string().optional().or(z.literal('')),
});

const contentSchema = z.object({
  logoUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  colorTheme: z.enum(['green-honey', 'indigo-gold', 'earth-olive', 'charcoal-green', 'sun-green']).optional(),

  heroMode: z.enum(['single', 'carousel']).default('single'),

  // Single hero fields
  heroTitle: z.string().optional().or(z.literal('')),
  heroSubtitle: z.string().optional().or(z.literal('')),
  heroImageUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  heroCtaText: z.string().optional().or(z.literal('')),
  heroCtaLink: z.string().optional().or(z.literal('')),

  // Carousel hero fields
  heroCarouselSlides: z.array(slideSchema).optional(),

  // Top Products
  topProducts: topProductsSchema.optional(),

  // Featured Categories
  featuredCategories: featuredCategoriesSchema.optional(),

  productPageOptions: productPageOptionsSchema.optional(),

  noticeBanner: z.string().optional().or(z.literal('')),
  aboutUs: z.string().min(1, 'About Us text is required.'),
  contact: z.object({
    address: z.string().min(1, 'Address is required.'),
    email: z.string().email('Invalid email address.'),
    phone: z.string().min(1, 'Phone number is required.'),
    messengerUsername: z.string().optional().or(z.literal('')),
    whatsappNumber: z.string().optional().or(z.literal('')),
    productChatHelperText: z.string().optional().or(z.literal('')),
    whatsappIconUrl: z.string().url().optional().or(z.literal('')),
    messengerIconUrl: z.string().url().optional().or(z.literal('')),
  }),
  checkoutNotice: z.string().min(1, 'Checkout notice is required.'),
});

const defaultAccordionValue = "homepage-content";

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true);
  const [activeAccordion, setActiveAccordion] = useState<string>('');
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

  const form = useForm<z.infer<typeof contentSchema>>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      logoUrl: '',
      colorTheme: 'green-honey',
      heroMode: 'single',
      heroTitle: '',
      heroSubtitle: '',
      heroImageUrl: '',
      heroCtaText: '',
      heroCtaLink: '',
      heroCarouselSlides: [],
      topProducts: {
        isEnabled: false,
        title: 'Top Products',
        productIds: [],
      },
      featuredCategories: {
        isEnabled: false,
        title: 'Featured Categories',
        categoryIds: [],
      },
      productPageOptions: {
        showQuickContact: true,
        whatsappInquiryMessage: "Hello, I'm interested in this product: {{productName}} - {{productUrl}}",
      },
      noticeBanner: '',
      aboutUs: '',
      contact: {
        address: '',
        email: '',
        phone: '',
        messengerUsername: '',
        whatsappNumber: '',
        productChatHelperText: '',
        whatsappIconUrl: '',
        messengerIconUrl: '',
      },
      checkoutNotice: '',
    },
  })

  useEffect(() => {
    const lastSection = localStorage.getItem('contentAdminAccordion') || defaultAccordionValue;
    setActiveAccordion(lastSection);
  }, []);

  const handleAccordionChange = (value: string) => {
    setActiveAccordion(value);
    if (value) {
      localStorage.setItem('contentAdminAccordion', value);
    } else {
      localStorage.removeItem('contentAdminAccordion');
    }
  };


  useEffect(() => {
    async function fetchContent() {
      try {
        const content = await getContent();
        // Ensure arrays and objects are initialized
        content.colorTheme = content.colorTheme || 'green-honey';
        content.heroCarouselSlides = content.heroCarouselSlides || [];
        content.topProducts = content.topProducts || { isEnabled: false, title: 'Top Products', productIds: [] };
        content.featuredCategories = content.featuredCategories || { isEnabled: false, title: 'Featured Categories', categoryIds: [] };
        content.productPageOptions = content.productPageOptions || { showQuickContact: true, whatsappInquiryMessage: "Hello, I'm interested in this product: {{productName}} - {{productUrl}}" };
        form.reset(content);
      } catch (error) {
        console.error("Failed to fetch content", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load site content.' });
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [form, toast]);


  async function onSubmit(values: z.infer<typeof contentSchema>) {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore is not available.' });
      return;
    }
    try {
      await setDoc(doc(firestore, 'content', 'static'), values, { merge: true });

      // Fix: Clear Next.js cache to ensure theme changes reflect immediately
      await revalidateApp();

      toast({
        title: 'Content Updated',
        description: 'Site content has been saved successfully.',
      });
      router.refresh();
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: e.message || 'An unknown error occurred.',
      });
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    )
  }

  const { formState: { isSubmitting, isDirty } } = form;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Site Content</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Accordion
            type="single"
            collapsible
            value={activeAccordion}
            onValueChange={handleAccordionChange}
          >
            <BrandingAppearanceSection form={form} />
            <HomepageContentSection form={form} />
            <ProductCatalogSection form={form} />
            <CommunicationNoticesSection form={form} />
            <AboutContactSection form={form} />
            <AdvancedSection form={form} />
          </Accordion>

          {isDirty && (
            <div className="fixed bottom-20 md:bottom-6 right-6 z-[51] flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => form.reset()}
                disabled={isSubmitting}
                className="bg-background shadow-lg"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={isSubmitting} className="shadow-lg">
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}
