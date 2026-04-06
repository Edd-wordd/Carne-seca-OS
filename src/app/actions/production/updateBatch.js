'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function updateBatchHandler(production_id, raw_weight) {
    const supabase = await createClient();
    try {
        if (!production_id) return { success: false, message: 'Batch ID is required.' };
        if (!raw_weight || raw_weight <= 0) return { success: false, message: 'Raw weight must be greater than 0.' };
        if (!Number.isFinite(raw_weight)) return { success: false, message: 'Raw weight must be a valid number.' };
        if (raw_weight > 200) return { success: false, message: 'Raw weight cannot exceed 200 lbs.' };

        const { error } = await supabase.rpc('update_production_batch', {
            p_production_id: production_id,
            p_raw_weight: raw_weight,
        });

        if (error) return { success: false, message: error.message };

        revalidatePath('/admin/operations/production');
        return { success: true, message: 'Batch updated successfully.' };
    } catch (error) {
        return { success: false, message: error?.message ?? 'unknown error' };
    }
}

export const updateBatch = withSentryAction('updateBatch', withAuth(updateBatchHandler));
