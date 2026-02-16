import { ProductForm } from "@/components/admin/product-form";
import { getProduct } from "@/lib/firebase-data";
import { STATIC_CATEGORIES } from "@/config/categories";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: { productId: string } }) {
    const { productId } = params;
    const productData = await getProduct(productId);

    if (!productData) {
        notFound();
    }

    // Use hardcoded categories (consistent with frontend)
    const categories = STATIC_CATEGORIES.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug
    }));

    const product = { ...productData, createdAt: productData.createdAt.toDate().toISOString() };


    return (
        <div className="space-y-4">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/admin/products">Products</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Edit: {product.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Product</CardTitle>
                    <CardDescription>Update the details for this product.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductForm categories={categories} product={product} />
                </CardContent>
            </Card>
        </div>
    )
}
