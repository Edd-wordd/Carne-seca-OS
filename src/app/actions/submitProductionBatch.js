'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitProductionBatch(prevState, formData) {
    const supabase = await createClient();

    const supplierId = formData.get('supplierId');
    const rawWeight = Number(formData.get('rawWeight'));
    const costPerPoundRaw = formData.get('costPerPound');
    const costPerPound = costPerPoundRaw ? Number(costPerPoundRaw) : 0;
    const yieldPercentRaw = formData.get('yieldPercent');
    const yieldPercent = yieldPercentRaw ? Number(yieldPercentRaw) : 0;

    if (!supplierId) {
        return { success: false, message: 'Please select a supplier.' };
    }
    if (!rawWeight || rawWeight <= 0) {
        return { success: false, message: 'Raw weight must be greater than 0.' };
    }
    if (costPerPound < 0) {
        return { success: false, message: 'Cost per pound cannot be negative.' };
    }

    // Perform the database operation via RPC
    const { error } = await supabase.rpc('create_production_batch', {
        p_supplier_id: supplierId,
        p_raw_weight: rawWeight,
        p_cost_per_pound: costPerPound,
        p_yield_percent: yieldPercent,
    });

    if (error) {
        // Return error status to the client
        return { success: false, message: error.message };
    }

    // Refresh the path so the new row appears in your UI
    revalidatePath('/admin/production');
    return { success: true, message: 'Batch submitted successfully!' };
}
