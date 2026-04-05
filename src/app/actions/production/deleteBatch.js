'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function deleteBatchHandler(batchId) {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase.rpc('delete_production_batch', {
            p_batch_id: batchId,
        });
        if (error) return { success: false, message: error.message };
        revalidatePath('/admin/operations/production');
        return { success: true, message: `Batch deleted batch!` };
    } catch (error) {
        return { success: false, message: error?.message ?? 'unknown error' };
    }
}

export const deleteBatch = withSentryAction('deleteBatch', withAuth(deleteBatchHandler));
