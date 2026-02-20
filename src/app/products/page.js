import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AddToCartButton from '@/components/cart/AddItemButton';

export default async function ProductsPage() {
    // Create a Supabase client configured for server-side use (reads auth from cookies)
    const supabase = await createClient();

    // Fetch all products from the "products" table where status is "active" remember not to only rely on status active but also make sure that rls is enabled and the user is authenticated
    const { data: products, error } = await supabase.from('products').select('*').eq('status', 'active');

    if (error) {
        console.error(error);
        return (
            <div className="container mx-auto px-4 py-8 text-destructive">
                Error loading products. Please try again later.
            </div>
        );
    }

    // Show a friendly message when there are no products
    if (products === null || products.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p className="text-muted-foreground text-lg">No products available at this time. Check back soon!</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-16">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
                <p className="mt-1 text-muted-foreground">Browse our selection of premium dried meat.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden transition-shadow hover:shadow-md">
                        <CardHeader className="p-0">
                            {/* <div className="relative aspect-square w-full bg-muted">
                                {product.image_url ? (
                                    <Image
                                        src={product.image_url}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                        <span className="text-4xl font-light">—</span>
                                    </div>
                                )}
                            </div> */}
                            <div className="space-y-1.5 px-6 pt-4">
                                <CardTitle className="line-clamp-2">
                                    <Link href={`/products/${product.id}`} className="hover:underline">
                                        {product.name}
                                    </Link>
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-2 px-6">
                            <p className="text-muted-foreground text-sm line-clamp-3">{product.description}</p>
                            <p className="text-lg font-semibold">{formatPrice(product.price_cents)}</p>
                        </CardContent>
                        <CardFooter className="px-6 pb-6">
                            <AddToCartButton productId={product.id} />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
