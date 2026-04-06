'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

const NEW_SUPPLIER_VALUE = '__new__';

async function createProductionBatchHandler(prevState, formData) {
    const supabase = await createClient();
    try {
        let supplierId = formData.get('supplierId');
        const rawWeight = Number(formData.get('rawWeight'));
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
            if (name && name.length > 100)
                return { success: false, message: 'Supplier name cannot exceed 100 characters.' };
            if (email && email.length > 255) return { success: false, message: 'Supplier email is too long.' };
            if (phone && phone.length > 30) return { success: false, message: 'Supplier phone is too long.' };
            if (address && address.length > 300) return { success: false, message: 'Supplier address is too long.' };

            supplierId = null;
        } else if (!supplierId) {
            return { success: false, message: 'Please select a supplier.' };
        }

        if (!rawWeight || rawWeight <= 0) return { success: false, message: 'Raw weight must be greater than 0.' };
        if (!Number.isFinite(rawWeight)) return { success: false, message: 'Raw weight must be a valid number.' };
        if (rawWeight > 200) return { success: false, message: 'Raw weight cannot exceed 200 lbs.' };
        const { data: batchNumber, error } = await supabase.rpc('create_production_batch', {
            p_supplier_id: supplierId,
            p_raw_weight: rawWeight,
            p_yield_percent: yieldPercent,
            p_supplier_name: name,
            p_address: address,
            p_phone: phone,
            p_email: email,
        });

        if (error) return { success: false, message: error.message };

        revalidatePath('/admin/operations/production');
        return { success: true, message: `Batch ${batchNumber} created successfully!` };
    } catch (error) {
        return { success: false, message: error?.message ?? 'unknown error' };
    }
}

export const createProductionBatch = withSentryAction('createProductionBatch', withAuth(createProductionBatchHandler));
