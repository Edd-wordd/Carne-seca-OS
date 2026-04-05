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
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('products')
            .update({
                image_url: imageURL,
                name: productName,
                flavor,
                description,
                cost_per_bag: costPerBag,
                price_cents: Math.round(Number(priceDollars) * 100),
                size_grams: size ? Math.round(Number(size) * 28.3495) : null,
                launch_date: launchDate,
                category,
                status,
            })
            .eq('id', productID);

        if (error) return { success: false, message: error.message };
        return { success: true };
    } catch (error) {
        return { success: false, message: error?.message ?? 'unknown error' };
    }
}

export const updateProduct = withSentryAction('updateProduct', withAuth(updateProductHandler));
