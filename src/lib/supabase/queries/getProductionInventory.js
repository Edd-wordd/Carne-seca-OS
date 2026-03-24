'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';

async function getProductionInventoryHandler() {
    const supabase = await createClient();

    try {
        // Fetch production inventory
        const { data: inventory, error: inventoryError } = await supabase
            .from('production_inventory')
            .select('*, products(sku, name, price_cents, cost_per_bag, category)')
            .order('created_at', { ascending: true });

        // Fetch adjustments log
        const { data: adjustmentsLog, error: adjustmentsLogError } = await supabase
            .from('adjustments_log')
            .select('reason, total_loss_cost');

        if (inventoryError) return { success: false, message: inventoryError.message };
        if (adjustmentsLogError) return { success: false, message: adjustmentsLogError.message };

        return {
            inventory: inventory ?? [],
            adjustmentsLog: adjustmentsLog ?? [],
        };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export const getProductionInventory = withSentryAction('getInventory', getProductionInventoryHandler);
