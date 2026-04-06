'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function updateBatchHandler(production_id, raw_weight) {
    const supabase = await createClient();
    try {
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
