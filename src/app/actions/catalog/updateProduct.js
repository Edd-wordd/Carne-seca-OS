'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function updateProductHandler({
    productID,
    imageURL,
    productName,
    flavor,
    description,
    costPerBag,
    priceDollars,
    size,
    launchDate,
    category,
    status,
}) {
    if (!productID) return { success: false, error: 'Product ID required' };

    const price = Number(priceDollars);
    const cost = Number(costPerBag);

    if (!productName?.trim()) return { success: false, error: 'Product name required' };
    if (!Number.isFinite(price) || price <= 0) return { success: false, error: 'Invalid price' };
    if (!Number.isFinite(cost) || cost <= 0) return { success: false, error: 'Invalid cost' };

    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('products')
            .update({
                image_url: imageURL,
                name: productName.trim(),
                flavor,
                description,
                cost_per_bag: cost,
                price_cents: Math.round(price * 100),
                size_grams: size ? Math.round(Number(size) * 28.3495) : null,
                launch_date: launchDate,
                category,
                status,
            })
            .eq('id', productID)
            .select('id')
            .single();

        if (error || !data) return { success: false, error: error?.message ?? 'Product not found' };
        return { success: true };
    } catch (error) {
        return { success: false, error: error?.message ?? 'Unknown error' };
    }
}

export const updateProduct = withSentryAction('updateProduct', withAuth(updateProductHandler));
