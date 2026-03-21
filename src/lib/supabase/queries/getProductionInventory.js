'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';

async function getProductionInventoryHandler() {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('production_inventory')
            .select('*, products(sku, name, price_cents, cost_per_bag)')
            .order('created_at', { ascending: true });
        if (error) return { success: false, message: error.message };
        return data;
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export const getProductionInventory = withSentryAction('getInventory', getProductionInventoryHandler);
