'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function addSuppliesHandler({ item, category, unit, lowThreshold, description }) {
    const supabase = await createClient();

    // Cast first, then check. Forms send strings — Number() converts them.
    // Number.isFinite rejects NaN, Infinity, null, undefined, and strings.
    const threshold = Number(lowThreshold);
    if (!item || typeof item !== 'string' || item.trim().length === 0) {
        return { success: false, message: 'Item name is required' };
    }
    if (item.trim().length > 100) {
        return { success: false, message: 'Item name must be under 100 characters' };
    }
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
        return { success: false, message: 'Category is required' };
    }
    if (!unit || typeof unit !== 'string' || unit.trim().length === 0) {
        return { success: false, message: 'Unit is required' };
    }
    // lowThreshold is optional — but if provided it must be a valid non-negative number
    if (lowThreshold !== undefined && lowThreshold !== null && lowThreshold !== '') {
        if (!Number.isFinite(threshold) || threshold < 0) {
            return { success: false, message: 'Low threshold must be a positive number' };
        }
    }

    try {
        const { data, error } = await supabase
            .from('supplies')
            .insert({
                name: item.trim(),
                category: category.trim(),
                unit: unit.trim(),
                low_threshold: lowThreshold !== '' ? threshold : null,
                description: description?.trim() || null,
            })
            .select('id, name, category, unit, low_threshold, description')
            .single();

        if (error) return { success: false, message: error.message ?? 'Failed to add supply' };
        return { success: true, supply: data };
    } catch (error) {
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export const addSupplies = withSentryAction('addSupplies', withAuth(addSuppliesHandler));
