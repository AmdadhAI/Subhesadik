import { ProductForm } from "@/components/admin/product-form";
import { STATIC_CATEGORIES } from "@/config/categories";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default async function NewProductPage() {
    // Use hardcoded categories (consistent with frontend)
    const categories = STATIC_CATEGORIES.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug
    }));

    return (
        <div className="space-y-4">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard-ss2017/products">Products</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>New Product</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <Card>
                <CardHeader>
                    <CardTitle>Create New Product</CardTitle>
                    <CardDescription>Fill out the form below to add a new product to your store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductForm categories={categories} />
                </CardContent>
            </Card>
        </div>
    )
}
