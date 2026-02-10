import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';

export default async function ProductsPage() {
    // Create a Supabase client configured for server-side use (reads auth from cookies)
    const supabase = await createClient();

    // Fetch all products from the "products" table where status is "active" remember not to only rely on status active but also make sure that rls is enabled and the user is authenticated
    const { data: products, error } = await supabase.from('products').select('*').eq('status', 'active');

    if (error) {
        console.error(error);
        return <div>Error loading products</div>;
    }

    // Show a friendly message when there are no products
    if (products === null || products.length === 0) {
        return <div>No products available at this time. Check back soon!</div>;
    }

    // Render each product with its name, description, and formatted price
    return (
        <div>
            {products.map((product) => (
                <div key={product.id}>
                    <h2>{product.name}</h2>
                    <p>{product.description}</p>
                    <p>{formatPrice(product.price)}</p>
                </div>
            ))}
        </div>
    );
}
