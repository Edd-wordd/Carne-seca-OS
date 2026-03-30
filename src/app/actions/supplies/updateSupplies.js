'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';

async function updateSuppliesHandler({ name, category, unit, lowThreshold, description, supplyId }) {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('supplies')
            .update({
                name,
                category,
                unit,
                low_threshold: lowThreshold,
                description,
            })
            .eq('id', supplyId)
            .select('id, name, category, unit, low_threshold, description')
            .single();
        if (error) return { success: false, message: error?.message ?? 'Failed to Edit Supply' };
        return { success: true, supply: data };
    } catch (error) {
        return { success: false, message: error?.message ?? 'unknown error' };
    }
}

export const updateSupplies = withSentryAction('updateSupplies', updateSuppliesHandler);
