'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function handleDamagedGoodsHandler(production_id, amount_lost, reason) {
    const supabase = await createClient();
    try {
        // Input validation
        if (!production_id) return { success: false, message: 'Batch ID is required.' };
        if (!amount_lost || amount_lost <= 0) return { success: false, message: 'Amount lost must be greater than 0.' };
        if (!Number.isFinite(amount_lost)) return { success: false, message: 'Amount lost must be a valid number.' };
        if (amount_lost > 200) return { success: false, message: 'Amount lost cannot exceed 200 lbs.' };
        if (!reason?.trim()) return { success: false, message: 'Reason is required.' };
        if (reason.trim().length > 500) return { success: false, message: 'Reason cannot exceed 500 characters.' };

        // Idempotency — check batch is still in a damageable state
        const { data: batch, error: fetchError } = await supabase
            .from('production_batches')
            .select('tracking_status, raw_weight')
            .eq('production_id', production_id)
            .maybeSingle();

        if (fetchError) return { success: false, message: fetchError.message };
        if (!batch) return { success: false, message: 'Batch not found.' };
        if (batch.tracking_status === 'damaged') {
            return { success: false, message: 'This batch has already been marked as damaged.' };
        }
        if (batch.tracking_status === 'finished') {
            return { success: false, message: 'Cannot mark a finished batch as damaged.' };
        }
        if (amount_lost > batch.raw_weight) {
            return {
                success: false,
                message: `Amount lost cannot exceed current batch weight of ${batch.raw_weight} lbs.`,
            };
        }

        const { error } = await supabase.rpc('handle_damaged_goods', {
            p_production_id: production_id,
            p_amount_lost: amount_lost,
            p_reason: reason.trim(),
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
