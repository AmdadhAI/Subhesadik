export interface ProductVariant {
    name: string;
    price: number;
    oldPrice?: number;
    inStock: boolean;
}

export type SerializedProduct = {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  images: string[];
  videoUrl?: string;
  features: string[];
  description: string;
  hasVariants: boolean;
  price?: number;
  oldPrice?: number;
  inStock?: boolean;
  variantType?: 'weight' | 'volume' | 'size' | 'custom';
  variants?: ProductVariant[];
  isActive: boolean;
  createdAt: string | null;
};

export type SerializedCategory = {
  id: string;
  name: string;
  slug: string;
  order: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string | null;
};
