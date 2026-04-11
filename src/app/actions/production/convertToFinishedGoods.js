'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function convertToFinishedGoodsHandler(productId, flavorSplits) {
    const supabase = await createClient();
    try {
        // Input validation
        if (!productId) return { success: false, message: 'Product ID is required.' };
        if (!Array.isArray(flavorSplits) || flavorSplits.length === 0) {
            return { success: false, message: 'At least one flavor split is required.' };
        }
        if (flavorSplits.length > 20) {
            return { success: false, message: 'Cannot exceed 20 flavor splits per batch.' };
        }
        for (const split of flavorSplits) {
            if (!split.flavor?.trim()) return { success: false, message: 'Each split must have a valid flavor.' };
            if (!split.size_grams || split.size_grams <= 0)
                return { success: false, message: 'Each split must have a valid size.' };
            if (!split.bags || split.bags <= 0)
                return { success: false, message: 'Each split must have at least 1 bag.' };
            if (!Number.isInteger(split.bags)) return { success: false, message: 'Bag count must be a whole number.' };
            if (split.bags > 10000) return { success: false, message: 'Bag count cannot exceed 10,000 per split.' };
        }

        // Idempotency — already handled in the RPC with the 'finished' status check
        const { error } = await supabase.rpc('convert_finished_goods', {
            p_production_id: productId,
            p_flavor_splits: flavorSplits,
        });

        if (error) {
            console.error('RPC Error:', error.message);
            return { success: false, message: error.message };
        }

        revalidatePath('/admin/operations/production');
        return { success: true, message: 'Goods converted successfully' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export const convertToFinishedGoods = withSentryAction(
    'convertToFinishedGoods',
    withAuth(convertToFinishedGoodsHandler),
);
