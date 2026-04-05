'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function adjustStockHandler({ productId, adjustType, quantity, reason, notes }) {
    const supabase = await createClient();

    try {
        // 1. Fetch cost_per_bag from products
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('cost_per_bag')
            .eq('id', productId)
            .single();

        if (productError || !product) {
            return { success: false, error: productError?.message ?? 'Product not found' };
        }

        const costPerBag = Number(product.cost_per_bag) ?? 0;

        // 2. Calculate change_amount (positive if add, negative if remove)
        const changeAmount = adjustType === 'add' ? quantity : -quantity;

        // 3. Calculate total_loss_cost (only if remove)
        const totalLossCost = adjustType === 'remove' ? Math.abs(changeAmount) * costPerBag : 0;

        // 4. Update production_inventory — fetch current row first to validate available
        const { data: inventoryRow, error: fetchError } = await supabase
            .from('production_inventory')
            .select('available')
            .eq('product_id', productId)
            .single();

        if (fetchError || !inventoryRow) {
            return { success: false, error: fetchError?.message ?? 'Production inventory row not found' };
        }

        const currentAvailable = Number(inventoryRow.available) ?? 0;
        const newAvailable = currentAvailable + changeAmount;

        if (newAvailable < 0) {
            return { success: false, error: 'Insufficient stock: available cannot go below 0' };
        }

        const { data: updatedInventory, error: updateError } = await supabase
            .from('production_inventory')
            .update({ available: newAvailable })
            .eq('product_id', productId)
            .select()
            .single();

        if (updateError) {
            return { success: false, error: updateError.message };
        }

        // 5. Insert into adjustments_log
        const { error: insertError } = await supabase.from('adjustments_log').insert({
            product_id: productId,
            change_amount: changeAmount,
            reason,
            adjustment_type: reason,
            notes: notes ?? null,
            total_loss_cost: totalLossCost,
        });

        if (insertError) {
            return { success: false, error: insertError.message };
        }

        return { success: true };
    } catch (err) {
        return { success: false, error: err?.message ?? 'Unknown error' };
    }
}
export const adjustStock = withSentryAction('adjustStock', withAuth(adjustStockHandler));
