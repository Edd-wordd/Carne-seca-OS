'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

function isForeignKeyViolation(error) {
    if (!error) return false;
    const code = String(error.code ?? '');
    const msg = String(error.message ?? '');
    const details = String(error.details ?? '');
    return (
        code === '23503' ||
        /foreign key constraint/i.test(msg) ||
        /violates foreign key/i.test(msg) ||
        /foreign key constraint/i.test(details)
    );
}

async function softHideSupply(supabase, supplyId) {
    const { error } = await supabase.from('supplies').update({ status: 'hidden' }).eq('id', supplyId);
    if (error) {
        return { success: false, message: error?.message ?? 'Failed to hide supply' };
    }
    return { success: true, softDeleted: true };
}

async function deleteSupplyHandler(supplyId) {
    const supabase = await createClient();

    try {
        const { error } = await supabase.from('supplies').delete().eq('id', supplyId);

        if (!error) {
            return { success: true, deleted: true };
        }

        if (isForeignKeyViolation(error)) {
            return softHideSupply(supabase, supplyId);
        }

        return { success: false, message: error?.message ?? 'Failed to delete supply' };
    } catch (error) {
        if (isForeignKeyViolation(error)) {
            return softHideSupply(supabase, supplyId);
        }
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export const deleteSupply = withSentryAction('deleteSupply', withAuth(deleteSupplyHandler));
