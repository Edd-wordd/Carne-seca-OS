'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';

async function getBatchesHandler() {
    const supabase = await createClient();

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

    if (error) {
        console.error('Came back error', error);
    }

    return data;
}

export const getBatches = withSentryAction('getBatches', getBatchesHandler);
