'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';

async function getBatchesHandler() {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('production_batches')
            .select(
                `
            *,
            suppliers (
                name
            ),
            finished_bags (
                stock_quantity
            )
        `,
            )
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) return { success: false, message: error.message };

        return data;
    } catch (error) {
        if (error)
            return {
                success: false,
                message: error?.message ?? 'unknown error',
            };
    }
}

export const getBatches = withSentryAction('getBatches', getBatchesHandler);
