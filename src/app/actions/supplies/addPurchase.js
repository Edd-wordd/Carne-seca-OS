'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function addPurchaseHandler({ item, date, quantity, cost, supplier, payment, purchasedBy, newSupplier }) {
    const supabase = await createClient();

    // Validate shared fields first regardless of which branch runs
    const qty = Number(quantity);
    const unitCost = Number(cost);

    if (!item) return { success: false, message: 'Supply item is required' };
    if (!date) return { success: false, message: 'Purchase date is required' };
    if (!Number.isFinite(qty) || qty <= 0) {
        return { success: false, message: 'Quantity must be a positive number' };
    }
    if (!Number.isFinite(unitCost) || unitCost <= 0) {
        return { success: false, message: 'Cost must be a positive number' };
    }
    if (!payment) return { success: false, message: 'Payment method is required' };

    try {
        if (supplier === '__add_new__') {
            if (!newSupplier || typeof newSupplier !== 'string' || newSupplier.trim().length === 0) {
                return { success: false, message: 'New supplier name is required' };
            }
            if (newSupplier.trim().length > 100) {
                return { success: false, message: 'Supplier name must be under 100 characters' };
            }

            const { error } = await supabase.rpc('add_purchase_with_supplier', {
                p_supply_id: item,
                p_supplier_name: newSupplier.trim(),
                p_quantity: qty,
                p_unit_cost: unitCost,
                p_purchase_date: date,
                p_payment_method: payment,
                p_purchased_by: purchasedBy,
            });

            if (error) return { success: false, message: error.message ?? 'Failed to add purchase' };
            return { success: true };
        } else {
            // Existing supplier — single insert, no RPC needed
            if (!supplier) return { success: false, message: 'Supplier is required' };

            const { error } = await supabase.from('supply_purchases').insert({
                supply_id: item,
                supplier_id: supplier,
                quantity: qty,
                unit_cost: unitCost,
                purchase_date: date,
                payment_method: payment,
                purchased_by: purchasedBy,
            });

            if (error) return { success: false, message: error?.message ?? 'Failed to add purchase' };
            return { success: true };
        }
    } catch (error) {
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export const addPurchase = withSentryAction('addPurchase', withAuth(addPurchaseHandler));
