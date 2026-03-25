'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';

async function addProductHandler({
    imageURL,
    productName,
    SKU,
    flavor,
    description,
    costPerBag,
    sellPrice,
    size,
    launchDate,
    visablity,
}) {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('products')
            .insert({
                image_url: imageURL,
                name: productName,
                sku: SKU,
                flavor: flavor,
                description: description,
                cost_per_bag: costPerBag,
                sell_price: Math.round(Number(sellPrice) * 100),
                size_grams: size ? Math.round(Number(size) * 28.3495) : null,
                launch_date: launchDate,
                status: visablity,
            })
            .select('id')
            .single();
        if (error || !data) {
            return { success: false, error: error?.message ?? 'Failed to add product' };
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: error?.message ?? 'Unknown error' };
    }
}

export const addProduct = withSentryAction('addProduct', addProductHandler);
