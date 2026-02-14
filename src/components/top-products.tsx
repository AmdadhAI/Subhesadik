import { getContent, getProductsByIds } from "@/lib/firebase-data";
import { ProductCard } from "./product-card";
import type { SerializedProduct } from "@/types/serialized";

export async function TopProducts() {
    const content = await getContent();
    const topProductsConfig = content.topProducts;

    if (!topProductsConfig || !topProductsConfig.isEnabled || !topProductsConfig.productIds?.length) {
        return null;
    }

    const products = await getProductsByIds(topProductsConfig.productIds);

    if (products.length === 0) {
        return null;
    }

    const serializableProducts: SerializedProduct[] = products.map(product => ({
      ...product,
      createdAt: product.createdAt.toDate().toISOString(),
    }));

    return (
        <div className="w-full">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold font-headline mb-6">{topProductsConfig.title}</h2>
            </div>
            <div className="pl-4 sm:pl-6 lg:pl-8">
              <div className="flex overflow-x-auto pb-6 -mb-6 gap-4">
                  {serializableProducts.map((product, index) => (
                      <div key={product.id} className="w-[45vw] sm:w-64 flex-shrink-0">
                          <ProductCard product={product} priority={index < 2} />
                      </div>
                  ))}
                  {/* Add a spacer to the end */}
                  <div className="w-1 h-1 flex-shrink-0" />
              </div>
            </div>
        </div>
    );
}
