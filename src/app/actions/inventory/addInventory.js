'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { generateSku } from '@/lib/utils/generateSku';
import { withAuth } from '@/lib/clerk/with-auth';

async function addInventoryHandler({ name, stock, lowThreshold, consignment, costToAcquire, sellPrice }) {
    if (!name?.trim()) return { success: false, error: 'Product name is required' };
    if (name.trim().length > 100) return { success: false, error: 'Product name must be under 100 characters' };
    if (stock < 0 || stock > 10000) return { success: false, error: 'Stock must be between 0 and 10,000' };
    if (lowThreshold < 0 || lowThreshold > 10000)
        return { success: false, error: 'Low threshold must be between 0 and 10,000' };

    const supabase = await createClient();

    try {
        const { error } = await supabase.rpc('add_inventory', {
            p_sku: generateSku(name.trim()),
            p_name: name.trim(),
            p_cost_per_bag: costToAcquire ?? 0,
            p_price_cents: Math.round(Number(sellPrice) * 100),
            p_stock: stock ?? 0,
            p_low_threshold: lowThreshold ?? 10,
            p_consignment: consignment ?? 0,
        });

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        return { success: false, error: err?.message ?? 'Unknown error' };
    }
}

export const addInventory = withSentryAction('addInventory', withAuth(addInventoryHandler));
