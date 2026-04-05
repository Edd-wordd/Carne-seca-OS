'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function updateInventoryHandler({ productId, lowThreshold }) {
    const supabase = await createClient();
    try {
        const { error } = await supabase
            .from('production_inventory')
            .update({ low_threshold: lowThreshold })
            .eq('product_id', productId);

        if (error) return { success: false, message: error.message };
        return { success: true };
    } catch (error) {
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export const updatedInventory = withSentryAction('updateInventory', withAuth(updateInventoryHandler));
