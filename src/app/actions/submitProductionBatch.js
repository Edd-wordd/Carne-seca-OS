'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const NEW_SUPPLIER_VALUE = '__new__';

export async function submitProductionBatch(prevState, formData) {
    const supabase = await createClient();

    let supplierId = formData.get('supplierId');
    const rawWeight = Number(formData.get('rawWeight'));
    const costPerPound = Number(formData.get('costPerPound') ?? 0);
    const yieldPercent = Number(formData.get('yieldPercent') ?? 0);
    let name = null;
    let address = null;
    let phone = null;
    let email = null;

    if (supplierId === NEW_SUPPLIER_VALUE) {
        name = formData.get('newSupplierName')?.toString().trim();
        address = formData.get('newSupplierAddress')?.toString().trim() || null;
        phone = formData.get('newSupplierPhone')?.toString().trim() || null;
        email = formData.get('newSupplierEmail')?.toString().trim() || null;
        if (!name) return { success: false, message: 'Please enter the new supplier name.' };
        supplierId = null;
    } else if (!supplierId) {
        return { success: false, message: 'Please select a supplier.' };
    }

    if (!rawWeight || rawWeight <= 0) return { success: false, message: 'Raw weight must be greater than 0.' };
    if (costPerPound < 0) return { success: false, message: 'Cost per pound cannot be negative.' };

    const { data: batchNumber, error } = await supabase.rpc('create_production_batch', {
        p_supplier_id: supplierId,
        p_raw_weight: rawWeight,
        p_cost_per_pound: costPerPound,
        p_yield_percent: yieldPercent,
        p_supplier_name: name,
        p_address: address,
        p_phone: phone,
        p_email: email,
    });

    if (error) return { success: false, message: error.message };

    revalidatePath('/admin/production');
    return { success: true, message: `Batch ${batchNumber} created successfully!` };
}
