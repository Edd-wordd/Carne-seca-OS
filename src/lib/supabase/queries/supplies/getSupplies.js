'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function getSuppliesHandler() {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase.rpc('get_supplies');

        if (error) return { success: false, message: error.message };

        return data;
    } catch (error) {
        return { success: false, message: error?.message ?? 'unknown error' };
    }
}

export const getSupplies = withSentryAction('getSupplies', withAuth(getSuppliesHandler));
