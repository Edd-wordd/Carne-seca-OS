'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';

async function getSuppliesHandler() {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase.rpc('get_supplies');

        if (error) return { succes: false, message: error.message };

        return data;
    } catch (error) {
        return { success: false, message: error?.message ?? 'unknown error' };
    }
}

export const getSupplies = withSentryAction('getSupplies', getSuppliesHandler);
