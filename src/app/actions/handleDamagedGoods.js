'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function handleDamagedGoods(production_id, amount_lost, reason) {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase.rpc('handle_damaged_goods', {
            p_production_id: production_id,
            p_amount_lost: amount_lost,
            p_reason: reason,
        });
        if (error) {
            console.error('RPC Error:', error.message);
            return { success: false, message: error.message };
        }
        revalidatePath('/admin/production');
        return { success: true, message: 'Batch inventory updated successfully' };
    } catch {
        if (error) return { success: false, message: error.message };
    }
}
