'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { generateSku } from '@/lib/utils/generateSku';

async function addProductHandler({
    imageURL,
    productName,
    flavor,
    description,
    costPerBag,
    priceDollars,
    size,
    launchDate,
    status,
    category,
}) {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('products')
            .insert({
                image_url: imageURL,
                name: productName,
                sku: generateSku(flavor),
                flavor: flavor,
                description: description,
                cost_per_bag: costPerBag,
                price_cents: Math.round(Number(priceDollars) * 100),
                size_grams: size ? Math.round(Number(size) * 28.3495) : null,
                launch_date: launchDate,
                status: status,
                category: category === 'merch' ? 'merch' : 'carne_seca',
            })
            .select('id, sku')
            .single();
        if (error || !data) {
            return { success: false, error: error?.message ?? 'Failed to add product' };
        }

        return { success: true, id: data.id, sku: data.sku };
    } catch (error) {
        return { success: false, error: error?.message ?? 'Unknown error' };
    }
}

export const addProduct = withSentryAction('addProduct', addProductHandler);
