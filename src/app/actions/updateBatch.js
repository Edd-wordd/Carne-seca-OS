'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateBatch(production_id, raw_weight, cost_per_pound) {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('update_production_batch', {
        p_production_id: production_id,
        p_raw_weight: raw_weight,
        p_cost_per_pound: cost_per_pound,
    });

    if (error)
        return {
            success: false,
            message: error.message,
        };
    revalidatePath('/admin/production');
    return { success: true, message: `${data}updated row!` };
}
