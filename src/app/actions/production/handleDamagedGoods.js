'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function handleDamagedGoodsHandler(production_id, amount_lost, reason) {
    const supabase = await createClient();
    try {
        const { error } = await supabase.rpc('handle_damaged_goods', {
            p_production_id: production_id,
            p_amount_lost: amount_lost,
            p_reason: reason,
        });
        if (error) {
            console.error('RPC Error:', error.message);
            return { success: false, message: error.message };
        }
        revalidatePath('/admin/operations/production');
        return { success: true, message: 'Batch inventory updated successfully' };
    } catch (error) {
        return { success: false, message: error?.message ?? 'unknown error' };
    }
}

export const handleDamagedGoods = withSentryAction('handleDamagedGoods', withAuth(handleDamagedGoodsHandler));
