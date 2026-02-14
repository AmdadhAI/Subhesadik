import type { Timestamp } from 'firebase/firestore';

export interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
  createdAt: Timestamp;
  imageUrl?: string;
}

export interface ProductVariant {
  name: string;
  price: number;
  oldPrice?: number;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  images: string[];
  videoUrl?: string;
  features: string[];
  description: string;
  hasVariants: boolean;
  // Fields for simple products
  price?: number;
  oldPrice?: number;
  inStock?: boolean;
  // Fields for variable products
  variantType?: 'weight' | 'volume' | 'size' | 'custom';
  variants?: ProductVariant[];
  isActive: boolean;
  createdAt: Timestamp;
}


export interface CartItem {
  id: string; // Composite ID: productId-variant.name
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantName?: string;
}

export interface CustomerInfo {
  fullName: string;
  mobile: string;
  address: string;
  shippingZone: 'Inside Dhaka' | 'Outside Dhaka';
  email?: string;
  notes?: string;
}

export interface Order {
  id:string;
  fullName: string;
  mobilePhoneNumber: string;
  address: string;
  shippingZone: 'Inside Dhaka' | 'Outside Dhaka';
  email?: string;
  orderNotes?: string;
  products: {
      productId: string;
      name: string;
      quantity: number;
      price: number;
      size?: string; // Corresponds to variantName
  }[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: 'COD';
  orderStatus: 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';
  createdAt: Timestamp;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imageHint?: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
}

export interface TopProductsConfig {
    isEnabled: boolean;
    title: string;
    productIds: string[];
}

export interface FeaturedCategoriesConfig {
    isEnabled: boolean;
    title: string;
    categoryIds: string[];
}

export type ColorTheme = 'green-honey' | 'indigo-gold' | 'earth-olive' | 'charcoal-green' | 'sun-green';

export interface SiteContent {
    colorTheme?: ColorTheme;
    heroMode?: 'single' | 'carousel';
    heroTitle?: string;
    heroSubtitle?: string;
    heroImageUrl?: string;
    heroCtaText?: string;
    heroCtaLink?: string;
    heroCarouselSlides?: HeroSlide[];
    topProducts?: TopProductsConfig;
    featuredCategories?: FeaturedCategoriesConfig;
    noticeBanner?: string;
    aboutUs: string;
    contact: {
        address: string;
        email: string;
        phone: string;
        messengerUsername?: string;
        whatsappNumber?: string;
        productChatHelperText?: string;
        whatsappIconUrl?: string;
        messengerIconUrl?: string;
    };
    checkoutNotice: string;
    logoUrl?: string;
    productPageOptions?: {
        showQuickContact: boolean;
        whatsappInquiryMessage?: string;
    }
}
