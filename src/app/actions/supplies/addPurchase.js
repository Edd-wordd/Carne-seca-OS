'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function addPurchaseHandler({ item, date, quantity, cost, supplier, payment, purchasedBy, newSupplier }) {
    const supabase = await createClient();
    try {
        if (supplier === '__add_new__') {
            // insert new supplier, get id back, then insert purchase
            const { data: supplierData, error: supplierError } = await supabase
                .from('suppliers')
                .insert({ name: newSupplier })
                .select('supplier_id')
                .single();

            if (supplierError || !supplierData) {
                return { success: false, message: supplierError?.message ?? 'Failed to add new supplier' };
            }

            const newSupplierId = supplierData.supplier_id;

            // Now insert the purchase using the new supplier id
            const { error: purchaseError } = await supabase.from('supply_purchases').insert({
                supply_id: item,
                supplier_id: newSupplierId,
                quantity,
                unit_cost: cost,
                purchase_date: date,
                payment_method: payment,
                purchased_by: purchasedBy,
            });

            if (purchaseError) {
                return { success: false, message: purchaseError?.message ?? 'Failed to Add Purchase' };
            }
            return { success: true };
        } else {
            // supplier is already an id, insert purchase directly
            const { error } = await supabase.from('supply_purchases').insert({
                supply_id: item,
                supplier_id: supplier,
                quantity,
                unit_cost: cost,
                purchase_date: date,
                payment_method: payment,
                purchased_by: purchasedBy,
            });

            if (error) {
                return { success: false, message: error?.message ?? 'Failed to Add Purchase' };
            }
            return { success: true };
        }
    } catch (error) {
        return { success: false, message: error?.message ?? 'unknown error' };
    }
}

export const addPurchase = withSentryAction('addPurchase', withAuth(addPurchaseHandler));
