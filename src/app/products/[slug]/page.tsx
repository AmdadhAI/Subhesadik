import { getProductBySlug, getCategory, getRelatedProducts } from '@/lib/firebase-data';
import { notFound } from 'next/navigation';
import { ProductView } from '@/components/product-view';
import type { SerializedProduct, SerializedCategory } from '@/types/serialized';

export const dynamic = 'force-dynamic';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>; // ✅ Changed: Promise<{ slug: string }>
}) {
  const { slug } = await params; // ✅ Changed: await params

  const productData = await getProductBySlug(slug);
  if (!productData) notFound();

  const [categoryData, relatedProductsData] = await Promise.all([
    getCategory(productData.categorySlug),
    getRelatedProducts(productData.categorySlug, productData.id),
  ]);

  return (
    <ProductView
      product={{
        ...productData,
        createdAt: productData.createdAt?.toDate().toISOString() ?? null,
      }}
      category={
        categoryData
          ? {
              ...categoryData,
              createdAt: categoryData.createdAt?.toDate().toISOString() ?? null,
            }
          : null
      }
      relatedProducts={relatedProductsData.map((p) => ({
        ...p,
        createdAt: p.createdAt?.toDate().toISOString() ?? null,
      }))}
    />
  );
}