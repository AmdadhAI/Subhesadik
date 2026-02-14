import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  DocumentData,
  Query,
  orderBy,
  limit,
  documentId,
} from "firebase/firestore";
import type { Product, Category, SiteContent } from "./types";
import { firebaseConfig } from "@/firebase/config";

/* ---------- Firebase Init ---------- */

// Helper to initialize and get Firestore instance, safe for server-side rendering
function getDb() {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    return getFirestore(app);
}

/* ---------- Helpers ---------- */

async function getDocsWithId<T>(q: Query<DocumentData>): Promise<T[]> {
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

async function getDocWithId<T>(docRef: any): Promise<T | null> {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
}


/* ---------- Categories ---------- */

export const getCategories = async (): Promise<Category[]> => {
  const db = getDb();
  const q = query(
    collection(db, "categories"),
    where("isActive", "==", true)
  );
  const categories = await getDocsWithId<Category>(q);
  // Sort in the application code to avoid needing a composite index
  return categories.sort((a, b) => a.order - b.order);
};

export const getCategoriesByIds = async (ids: string[]): Promise<Category[]> => {
  if (!ids || ids.length === 0) {
    return [];
  }
  const db = getDb();
  const categoriesCollection = collection(db, "categories");
  
  // Firestore 'in' query is limited to 30 items. We need to batch.
  const categoryPromises: Promise<Category[]>[] = [];
  for (let i = 0; i < ids.length; i += 30) {
    const batchIds = ids.slice(i, i + 30);
    const q = query(
      categoriesCollection,
      where(documentId(), "in", batchIds),
      where("isActive", "==", true)
    );
    categoryPromises.push(getDocsWithId<Category>(q));
  }
  
  const categoryBatches = await Promise.all(categoryPromises);
  const allCategories = categoryBatches.flat();

  // The 'in' query does not guarantee order, so we need to re-order based on the original IDs array.
  const categoryMap = new Map(allCategories.map(c => [c.id, c]));
  return ids.map(id => categoryMap.get(id)).filter((c): c is Category => !!c);
};

export const getCategory = async (
  slug: string
): Promise<Category | undefined> => {
    const db = getDb();
    const q = query(
        collection(db, "categories"),
        where("slug", "==", slug),
        where("isActive", "==", true),
        limit(1)
    );
    const categories = await getDocsWithId<Category>(q);
    return categories[0];
};

/* ---------- Products ---------- */

export const getProducts = async (
  categorySlug?: string
): Promise<Product[]> => {
  const db = getDb();
  let productQuery: Query<DocumentData>;

  const productsCollection = collection(db, "products");

  if (categorySlug) {
    productQuery = query(
      productsCollection,
      where("categorySlug", "==", categorySlug),
      where("isActive", "==", true)
    );
  } else {
    productQuery = query(
        productsCollection,
        where("isActive", "==", true)
    );
  }

  return getDocsWithId<Product>(productQuery);
};

export const getProductsByIds = async (ids: string[]): Promise<Product[]> => {
  if (!ids || ids.length === 0) {
    return [];
  }
  const db = getDb();
  const productsCollection = collection(db, "products");
  
  // Firestore 'in' query is limited to 30 items. We need to batch.
  const productPromises: Promise<Product[]>[] = [];
  for (let i = 0; i < ids.length; i += 30) {
    const batchIds = ids.slice(i, i + 30);
    const q = query(
      productsCollection,
      where(documentId(), "in", batchIds),
      where("isActive", "==", true)
    );
    productPromises.push(getDocsWithId<Product>(q));
  }
  
  const productBatches = await Promise.all(productPromises);
  const allProducts = productBatches.flat();

  // The 'in' query does not guarantee order, so we need to re-order based on the original IDs array.
  const productMap = new Map(allProducts.map(p => [p.id, p]));
  return ids.map(id => productMap.get(id)).filter((p): p is Product => !!p);
};

export const getProduct = async (
    id: string
): Promise<Product | null> => {
    const db = getDb();
    const docRef = doc(db, "products", id);
    return getDocWithId<Product>(docRef);
}

export const getProductBySlug = async (
  slug: string
): Promise<Product | undefined> => {
  const db = getDb();
  const q = query(
    collection(db, "products"),
    where("slug", "==", slug),
    where("isActive", "==", true),
    limit(1)
  );
  const products = await getDocsWithId<Product>(q);
  return products[0];
};

export const getRelatedProducts = async (
  categorySlug: string,
  currentProductId: string
): Promise<Product[]> => {
  const db = getDb();
  const q = query(
    collection(db, "products"),
    where("categorySlug", "==", categorySlug),
    where("isActive", "==", true),
    orderBy("createdAt", "desc"),
    limit(7) // Fetch a bit more to account for filtering out the current product
  );

  const products = await getDocsWithId<Product>(q);

  // Filter out the current product and return up to 6
  return products
    .filter((product) => product.id !== currentProductId)
    .slice(0, 6);
};


/* ---------- Site Content ---------- */
export const getContent = async (): Promise<SiteContent> => {
    const db = getDb();
    const docRef = doc(db, "content", "static");
    const docSnap = await getDoc(docRef);

    const defaults: Partial<SiteContent> = {
      colorTheme: 'green-honey',
      heroMode: 'single',
      heroTitle: 'Welcome to Subhe Sadik',
      heroSubtitle: 'Minimalist design, maximum satisfaction.',
      heroImageUrl: 'https://images.unsplash.com/photo-1621856139454-03ff9806204c?q=80&w=1964&auto=format&fit=crop',
      heroCtaText: 'Explore Collection',
      heroCtaLink: '/products',
      heroCarouselSlides: [],
      topProducts: {
        isEnabled: false,
        title: "Top Products",
        productIds: [],
      },
      featuredCategories: {
        isEnabled: false,
        title: "Featured Categories",
        categoryIds: [],
      },
      noticeBanner: '',
      logoUrl: '',
      contact: {
        address: '123 Subhe Sadik Lane, Dhaka, Bangladesh',
        email: 'support@subhesadik.com',
        phone: '+880 123 456 7890',
        messengerUsername: 'subhesadik',
        whatsappNumber: '8801234567890',
        productChatHelperText: 'Need help before buying?',
        whatsappIconUrl: '',
        messengerIconUrl: '',
      },
      aboutUs: 'Subhe Sadik is your one-stop shop for high-quality, minimalist products. We believe in "less is more" and strive to bring you items that are both beautiful and functional. Our collection is carefully curated to ensure that every product meets our high standards of quality and design.',
      checkoutNotice: 'Please note that shipping times may vary depending on your location. We appreciate your patience!',
      productPageOptions: {
        showQuickContact: true,
        whatsappInquiryMessage: "Hello, I am interested in this product: {{productName}} - {{productUrl}}",
      },
    }

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            ...defaults,
            ...data,
            topProducts: {
                ...defaults.topProducts!,
                ...(data.topProducts || {}),
            },
            featuredCategories: {
                ...defaults.featuredCategories!,
                ...(data.featuredCategories || {}),
            },
            contact: {
                ...defaults.contact,
                ...(data.contact || {}),
            },
            productPageOptions: {
                ...defaults.productPageOptions!,
                ...(data.productPageOptions || {}),
            }
        } as SiteContent;
    }

    return defaults as SiteContent;
};

/* ---------- Static Data (for forms, etc.) ---------- */

export const SHIPPING_ZONES = {
  'Inside Dhaka': 80,
  'Outside Dhaka': 130,
};

    