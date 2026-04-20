'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function getExpensesHandler() {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('expenses')
            .select('id, expense_number, category, vendor, vendor_id, note, payment_method, purchased_at, amount_cents')
            .is('deleted_at', null)
            .order('purchased_at', { ascending: false });

        if (error) return { success: false, message: error?.message ?? 'Unable to get Expenses' };

        return { success: true, data: data ?? [] };
    } catch (error) {
        return { success: false, message: error?.message ?? 'unknown error' };
    }
}

export const getExpenses = withSentryAction('getExpenses', withAuth(getExpensesHandler));
