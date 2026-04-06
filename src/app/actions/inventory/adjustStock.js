'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function adjustStockHandler({ productId, adjustType, quantity, reason, notes }) {
    if (!productId) return { success: false, error: 'Product ID is required' };
    if (!quantity || quantity <= 0 || quantity > 10000)
        return { success: false, error: 'Quantity must be between 1 and 10,000' };
    if (adjustType === 'remove' && !reason) return { success: false, error: 'Reason is required for removals' };

    const supabase = await createClient();

    try {
        const { error } = await supabase.rpc('adjust_stock', {
            p_product_id: productId,
            p_adjust_type: adjustType,
            p_quantity: quantity,
            p_reason: reason ?? null,
            p_notes: notes ?? null,
        });

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        return { success: false, error: err?.message ?? 'Unknown error' };
    }
}

export const adjustStock = withSentryAction('adjustStock', withAuth(adjustStockHandler));
