'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';

async function getSupplyPurchasesHandler() {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase.rpc('get_supply_purchases');
        if (error) return { success: false, message: error.message };
        return data;
    } catch (error) {
        return { success: false, message: error?.message ?? 'unknown error' };
    }
}

export const getSupplyPurchases = withSentryAction('getSupplyPurchases', getSupplyPurchasesHandler);
