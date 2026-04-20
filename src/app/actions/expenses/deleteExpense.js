'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function deleteExpenseHandler({ id }, { userId: _userId }) {
    const supabase = await createClient();

    const idStr = String(id ?? '').trim();
    if (!UUID_RE.test(idStr)) return { success: false, message: 'Invalid expense id' };

    const nowIso = new Date().toISOString();

    try {
        const { data, error } = await supabase
            .from('expenses')
            .update({ deleted_at: nowIso, updated_at: nowIso })
            .eq('id', idStr)
            .is('deleted_at', null)
            .select('id')
            .maybeSingle();

        if (error) return { success: false, message: error.message ?? 'Failed to delete expense' };
        if (!data) return { success: false, message: 'Expense not found or already deleted' };

        return { success: true };
    } catch (error) {
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export const deleteExpense = withSentryAction('deleteExpense', withAuth(deleteExpenseHandler));
