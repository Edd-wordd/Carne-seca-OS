'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function convertToFinishedGoodsHandler(productId, flavorSplits) {
    const supabase = await createClient();
    try {
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
