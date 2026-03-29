'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';

async function addSuppliesHandler({ item, category, unit, lowThreshold, description }) {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('supplies')
            .insert({
                name: item,
                category,
                unit,
                low_threshold: lowThreshold,
                description: description || null,
            })
            .select('id, name, category, unit, low_threshold, description')
            .single();
        if (error) return { success: false, message: error?.message ?? 'Failed to Add Supply' };
        return { success: true, supply: data };
    } catch (error) {
        return { success: false, message: error?.message ?? 'unknown error' };
    }
}

export const addSupplies = withSentryAction('addSupplies', addSuppliesHandler);
