'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';
import {
    categoryLabelToDb,
    normalizeExpenseFromDb,
    paymentMethodLabelToDb,
} from '@/lib/utils/normalizeExpenseFromDb';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function addExpenseHandler(
    { date, vendor, vendorId, category, note, amountCents, paymentMethod },
    { userId: _userId },
) {
    const supabase = await createClient();

    const vendorTrimmed = String(vendor ?? '').trim();
    if (!vendorTrimmed) return { success: false, message: 'Vendor is required' };

    const dateStr = String(date ?? '').trim();
    if (!DATE_RE.test(dateStr)) return { success: false, message: 'Valid date (YYYY-MM-DD) is required' };

    const cents = Number(amountCents);
    if (!Number.isInteger(cents) || cents <= 0) {
        return { success: false, message: 'Amount must be a positive whole number of cents' };
    }

    let vendorIdVal = null;
    if (vendorId != null && String(vendorId).trim() !== '') {
        const id = String(vendorId).trim();
        if (!UUID_RE.test(id)) return { success: false, message: 'Invalid supplier id' };
        vendorIdVal = id;
    }

    const noteVal = note == null ? null : String(note).trim() || null;
    const categoryDb = categoryLabelToDb(category);
    const paymentDb = paymentMethodLabelToDb(paymentMethod);
    const purchasedAt = `${dateStr}T00:00:00.000Z`;

    try {
        const { data, error } = await supabase
            .from('expenses')
            .insert({
                category: categoryDb,
                vendor: vendorTrimmed,
                vendor_id: vendorIdVal,
                note: noteVal,
                payment_method: paymentDb,
                purchased_at: purchasedAt,
                amount_cents: cents,
            })
            .select('id, expense_number, category, vendor, vendor_id, note, payment_method, purchased_at, amount_cents')
            .single();

        if (error) return { success: false, message: error.message ?? 'Failed to add expense' };

        const normalized = normalizeExpenseFromDb(data);
        if (!normalized) return { success: false, message: 'Failed to read new expense' };

        return { success: true, data: normalized };
    } catch (error) {
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export const addExpense = withSentryAction('addExpense', withAuth(addExpenseHandler));
