'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { generateSku } from '@/lib/utils/generateSku';

async function addInventoryHandler({ name, stock, lowThreshold, consignment, costToAcquire, sellPrice }) {
    const supabase = await createClient();

    try {
        const { data: product, error: productError } = await supabase
            .from('products')
            .insert({
                sku: generateSku(name),
                name,
                cost_per_bag: costToAcquire,
                price_cents: Math.round(Number(sellPrice) * 100),
                category: 'merch',
            })
            .select('id')
            .single();

        if (productError || !product) {
            return { success: false, error: productError?.message ?? 'Failed to create product' };
        }

        const { error: inventoryError } = await supabase.from('production_inventory').insert({
            product_id: product.id,
            available: stock,
            consignment: consignment ?? 0,
            low_threshold: lowThreshold ?? 10,
        });

        if (inventoryError) {
            return { success: false, error: inventoryError.message };
        }

        return { success: true };
    } catch (err) {
        return { success: false, error: err?.message ?? 'Unknown error' };
    }
}

export const addInventory = withSentryAction('addInventory', addInventoryHandler);
