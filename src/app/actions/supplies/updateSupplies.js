'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function updateSuppliesHandler({ name, category, unit, lowThreshold, description, supplyId }) {
    const supabase = await createClient();

    // supplyId must exist — without it we'd update every row in the table
    if (!supplyId) return { success: false, message: 'Supply ID is required' };

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return { success: false, message: 'Item name is required' };
    }
    if (name.trim().length > 100) {
        return { success: false, message: 'Item name must be under 100 characters' };
    }
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
        return { success: false, message: 'Category is required' };
    }
    if (!unit || typeof unit !== 'string' || unit.trim().length === 0) {
        return { success: false, message: 'Unit is required' };
    }

    const threshold = Number(lowThreshold);
    if (lowThreshold !== undefined && lowThreshold !== null && lowThreshold !== '') {
        if (!Number.isFinite(threshold) || threshold < 0) {
            return { success: false, message: 'Low threshold must be a positive number' };
        }
    }

    try {
        const { data, error } = await supabase
            .from('supplies')
            .update({
                name: name.trim(),
                category: category.trim(),
                unit: unit.trim(),
                low_threshold: lowThreshold !== '' ? threshold : null,
                description: description?.trim() || null,
            })
            .eq('id', supplyId)
            // .select() after update catches silent success on wrong ID —
            // without this, Supabase returns success even if no row matched
            .select('id, name, category, unit, low_threshold, description')
            .single();

        if (error) return { success: false, message: error.message ?? 'Failed to update supply' };
        if (!data) return { success: false, message: 'Supply not found' };
        return { success: true, supply: data };
    } catch (error) {
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export const updateSupplies = withSentryAction('updateSupplies', withAuth(updateSuppliesHandler));
