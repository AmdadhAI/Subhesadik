'use client';

import { Firestore, writeBatch, doc, serverTimestamp } from "firebase/firestore";
import type { Product, Category } from "./types";
import { PlaceHolderImages } from "./placeholder-images";
import { slugify } from "./utils";

const sampleCategoriesData: Omit<Category, 'id' | 'createdAt'>[] = [
    { name: 'Organic Foods', slug: 'organic-foods', isActive: true, order: 1, imageUrl: PlaceHolderImages.find(p => p.id === 'product-honey')?.imageUrl },
    { name: 'Punjabi', slug: 'punjabi', isActive: true, order: 2, imageUrl: PlaceHolderImages.find(p => p.id === 'product-punjabi-white')?.imageUrl },
    { name: 'Perfume & Attar', slug: 'perfume-attar', isActive: true, order: 3, imageUrl: PlaceHolderImages.find(p => p.id === 'product-attar-oud')?.imageUrl },
    { name: 'Burkha', slug: 'burkha', isActive: true, order: 4, imageUrl: PlaceHolderImages.find(p => p.id === 'product-burkha-black')?.imageUrl },
    { name: 'Others / Mixed', slug: 'others-mixed', isActive: true, order: 5, imageUrl: PlaceHolderImages.find(p => p.id === 'product-wall-clock')?.imageUrl },
];

const sampleProductsData = [
  // Organic Foods - Variable
  {
    name: 'Raw Natural Honey (Sundarbans)',
    images: [PlaceHolderImages.find(p => p.id === 'product-honey')?.imageUrl || ''],
    description: '100% pure, raw, and natural honey collected from the Sundarbans. Free from any added sugar or preservatives.',
    features: ['100% pure & raw', 'No added sugar', 'Collected from Sundarbans'],
    hasVariants: true,
    variantType: 'weight',
    variants: [
      { name: '500g', price: 750, oldPrice: 850, inStock: true },
      { name: '1kg', price: 1400, oldPrice: 1600, inStock: true }
    ],
    isActive: true,
    categorySlug: 'organic-foods'
  },
  // Organic Foods - Simple
  {
    name: 'Organic Black Seed (Kalojira)',
    images: [PlaceHolderImages.find(p => p.id === 'product-black-seed')?.imageUrl || ''],
    description: 'Premium quality, chemical-free, and sun-dried organic black seeds (kalojira).',
    features: ['Chemical-free', 'Sun-dried', 'Premium quality'],
    hasVariants: false,
    price: 420,
    inStock: true,
    isActive: true,
    categorySlug: 'organic-foods'
  },
  // Organic Foods - Simple
  {
    name: 'Organic Cashew Nuts',
    images: [PlaceHolderImages.find(p => p.id === 'product-cashew')?.imageUrl || ''],
    description: 'Fresh, crunchy, and delicious organic cashew nuts with no added preservatives.',
    features: ['Fresh & crunchy', 'No preservatives'],
    hasVariants: false,
    price: 1150,
    oldPrice: 1250,
    inStock: true,
    isActive: true,
    categorySlug: 'organic-foods'
  },
  // Organic Foods - Simple
  {
    name: 'Organic Almond (Badam)',
    images: [PlaceHolderImages.find(p => p.id === 'product-almond')?.imageUrl || ''],
    description: 'High-quality imported organic almonds, vacuum-packed to retain freshness.',
    features: ['Imported quality', 'Vacuum packed'],
    hasVariants: false,
    price: 1450,
    inStock: true,
    isActive: true,
    categorySlug: 'organic-foods'
  },
  // Punjabi - Variable
  {
    name: 'Men’s Cotton Punjabi – Classic White',
    images: [PlaceHolderImages.find(p => p.id === 'product-punjabi-white')?.imageUrl || ''],
    description: 'A classic white punjabi made from 100% pure cotton. Comfortable for daily wear and available in multiple sizes.',
    features: ['100% cotton', 'Comfortable for daily wear'],
    hasVariants: true,
    variantType: 'size',
    variants: [
        { name: 'M', price: 1850, inStock: true },
        { name: 'L', price: 1850, inStock: true },
        { name: 'XL', price: 1850, inStock: true },
    ],
    isActive: true,
    categorySlug: 'punjabi'
  },
  // Punjabi - Variable
  {
    name: 'Men’s Semi-Silk Punjabi – Maroon',
    images: [PlaceHolderImages.find(p => p.id === 'product-punjabi-maroon')?.imageUrl || ''],
    description: 'An elegant maroon punjabi made from a luxurious semi-silk fabric, perfect for special occasions.',
    features: ['Semi-silk fabric', 'Suitable for occasions'],
    hasVariants: true,
    variantType: 'size',
    variants: [
      { name: 'M', price: 2450, inStock: true },
      { name: 'L', price: 2450, inStock: true },
      { name: 'XL', price: 2450, inStock: false },
    ],
    isActive: true,
    categorySlug: 'punjabi'
  },
  // Punjabi - Variable
  {
    name: 'Printed Punjabi – Navy Blue',
    images: [PlaceHolderImages.find(p => p.id === 'product-punjabi-navy')?.imageUrl || ''],
    description: 'A stylish printed punjabi in navy blue, featuring a modern design and a soft, comfortable fabric.',
    features: ['Modern design', 'Soft fabric'],
    hasVariants: true,
    variantType: 'size',
    variants: [
      { name: 'M', price: 1950, inStock: true },
      { name: 'L', price: 1950, inStock: true },
    ],
    isActive: true,
    categorySlug: 'punjabi'
  },
  // Perfume & Attar - Simple
  {
    name: 'Premium Attar – Oud',
    images: [PlaceHolderImages.find(p => p.id === 'product-attar-oud')?.imageUrl || ''],
    description: 'A premium, alcohol-free attar with the exotic and long-lasting fragrance of Oud.',
    features: ['Alcohol-free', 'Long lasting fragrance'],
    hasVariants: false,
    price: 1200,
    inStock: true,
    isActive: true,
    categorySlug: 'perfume-attar'
  },
  // Perfume & Attar - Simple
  {
    name: 'Attar – Rose',
    images: [PlaceHolderImages.find(p => p.id === 'product-attar-rose')?.imageUrl || ''],
    description: 'A mild and refreshing attar made from natural rose extract.',
    features: ['Natural rose extract', 'Mild & refreshing'],
    hasVariants: false,
    price: 650,
    inStock: true,
    isActive: true,
    categorySlug: 'perfume-attar'
  },
  // Perfume & Attar - Simple
  {
    name: 'Men’s Perfume – Arabic Blend',
    images: [PlaceHolderImages.find(p => p.id === 'product-perfume-arabic')?.imageUrl || ''],
    description: 'A men\'s perfume with a strong, masculine Arabic fragrance blend. Suitable for daily use.',
    features: ['Strong fragrance', 'Suitable for daily use'],
    hasVariants: false,
    price: 2100,
    inStock: true,
    isActive: true,
    categorySlug: 'perfume-attar'
  },
  // Burkha - Variable
  {
    name: 'Simple Black Burkha',
    images: [PlaceHolderImages.find(p => p.id === 'product-burkha-black')?.imageUrl || ''],
    description: 'A simple and elegant black burkha made from lightweight fabric for a comfortable fit.',
    features: ['Lightweight fabric', 'Comfortable fit'],
    hasVariants: true,
    variantType: 'size',
    variants: [
      { name: '52', price: 2800, inStock: true },
      { name: '54', price: 2800, inStock: true },
      { name: '56', price: 2800, inStock: true },
    ],
    isActive: true,
    categorySlug: 'burkha'
  },
  // Burkha - Variable
  {
    name: 'Embroidered Burkha',
    images: [PlaceHolderImages.find(p => p.id === 'product-burkha-embroidered')?.imageUrl || ''],
    description: 'An occasion-wear burkha featuring elegant embroidery for a sophisticated look.',
    features: ['Elegant embroidery', 'Occasion wear'],
    hasVariants: true,
    variantType: 'size',
    variants: [
      { name: '52', price: 3450, inStock: true },
      { name: '54', price: 3450, inStock: true },
    ],
    isActive: true,
    categorySlug: 'burkha'
  },
  // Others / Mixed - Simple
  {
    name: 'Islamic Wall Clock',
    images: [PlaceHolderImages.find(p => p.id === 'product-wall-clock')?.imageUrl || ''],
    description: 'A beautifully designed Islamic wall clock to adorn your home.',
    features: ['Islamic calligraphy design', 'Silent quartz movement'],
    hasVariants: false,
    price: 1350,
    inStock: true,
    isActive: true,
    categorySlug: 'others-mixed'
  },
  // Others / Mixed - Simple
  {
    name: 'Tasbih (Wooden) – 100 Beads',
    images: [PlaceHolderImages.find(p => p.id === 'product-tasbih')?.imageUrl || ''],
    description: 'A traditional wooden tasbih with 100 beads for prayer and dhikr.',
    features: ['100 wooden beads', 'Durable string'],
    hasVariants: false,
    price: 220,
    inStock: true,
    isActive: true,
    categorySlug: 'others-mixed'
  },
];


export async function seedDatabase(db: Firestore) {
    const batch = writeBatch(db);

    console.log("Starting to seed database...");

    // Seed categories
    for (const categoryData of sampleCategoriesData) {
        const categoryRef = doc(db, "categories", categoryData.slug);
        batch.set(categoryRef, { ...categoryData, createdAt: serverTimestamp() });
    }
    console.log("Categories prepared for batch write.");

    // Seed products
    for (const productData of sampleProductsData) {
        const productSlug = slugify(productData.name);
        const productRef = doc(db, "products", productSlug);

        // This type assertion helps TypeScript understand the shape, even though it's partial
        const productToSave: Partial<Omit<Product, 'id' | 'createdAt'>> = {
          slug: productSlug,
          name: productData.name,
          images: productData.images,
          description: productData.description,
          features: productData.features,
          isActive: productData.isActive,
          categorySlug: productData.categorySlug,
          hasVariants: productData.hasVariants,
        }
        
        if (productData.hasVariants) {
            productToSave.variants = productData.variants;
            productToSave.variantType = productData.variantType as any;
        } else {
            productToSave.price = productData.price;
            productToSave.oldPrice = productData.oldPrice;
            productToSave.inStock = productData.inStock;
        }

        batch.set(productRef, { ...productToSave, createdAt: serverTimestamp() });
    }
    console.log("Products prepared for batch write.");

    try {
        await batch.commit();
        console.log("✅ Database seeded successfully!");
        return { success: true };
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        return { success: false, error: (error as Error).message };
    }
}

    