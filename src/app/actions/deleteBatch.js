'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteBatch(batchId) {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('delete_production_batch', {
        p_batch_id: batchId,
    });
    if (error) return { success: false, message: error.message };
    revalidatePath('/admin/production');
    return { success: true, message: `Batch deleted batch!` };
}
