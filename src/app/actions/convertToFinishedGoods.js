'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function convertToFinishedGoods(productId, flavorSplits) {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase.rpc('convert_finished_goods', {
            p_production_id: productId,
            p_flavor_splits: flavorSplits,
        });
        if (error) {
            console.error('RPC Error:', error.message);
            return { success: false, message: error.message };
        }
        revalidatePath('/admin/production');
        return { success: true, message: 'Goods converted successfully' };
    } catch (error) {
        if (error) return { success: false, message: error.message };
    }
}
