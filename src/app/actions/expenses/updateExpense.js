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

async function updateExpenseHandler(
    { id, date, vendor, vendorId, category, note, amountCents, paymentMethod },
    { userId: _userId },
) {
    const supabase = await createClient();

    const idStr = String(id ?? '').trim();
    if (!UUID_RE.test(idStr)) return { success: false, message: 'Invalid expense id' };

    const vendorTrimmed = String(vendor ?? '').trim();
    if (!vendorTrimmed) return { success: false, message: 'Vendor is required' };

    const dateStr = String(date ?? '').trim();
    if (!DATE_RE.test(dateStr)) return { success: false, message: 'Valid date (YYYY-MM-DD) is required' };

    const cents = Number(amountCents);
    if (!Number.isInteger(cents) || cents <= 0) {
        return { success: false, message: 'Amount must be a positive whole number of cents' };
    }

    const noteVal = note == null ? null : String(note).trim() || null;
    const categoryDb = categoryLabelToDb(category);
    const paymentDb = paymentMethodLabelToDb(paymentMethod);
    const purchasedAt = `${dateStr}T00:00:00.000Z`;
    const nowIso = new Date().toISOString();

    let vendorIdVal = null;
    if (vendorId != null && String(vendorId).trim() !== '') {
        const vid = String(vendorId).trim();
        if (!UUID_RE.test(vid)) return { success: false, message: 'Invalid supplier id' };
        vendorIdVal = vid;
    }

    try {
        const { data, error } = await supabase
            .from('expenses')
            .update({
                category: categoryDb,
                vendor: vendorTrimmed,
                vendor_id: vendorIdVal,
                note: noteVal,
                payment_method: paymentDb,
                purchased_at: purchasedAt,
                amount_cents: cents,
                updated_at: nowIso,
            })
            .eq('id', idStr)
            .is('deleted_at', null)
            .select('id, category, vendor, vendor_id, note, payment_method, purchased_at, amount_cents')
            .single();

        if (error) return { success: false, message: error.message ?? 'Failed to update expense' };

        const normalized = normalizeExpenseFromDb(data);
        if (!normalized) return { success: false, message: 'Failed to read updated expense' };

        return { success: true, data: normalized };
    } catch (error) {
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export const updateExpense = withSentryAction('updateExpense', withAuth(updateExpenseHandler));
