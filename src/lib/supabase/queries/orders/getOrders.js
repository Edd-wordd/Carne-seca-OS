'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function getOrdersHandler() {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('orders')
            .select(
                `
                *,
                order_items (
                    id,
                    product_id,
                    product_name,
                    quantity,
                    price_at_purchase
                )
            `,
            )
            .order('created_at', { ascending: false });

        if (error) return { success: false, message: error.message };

        return { success: true, data };
    } catch (error) {
        return { success: false, message: error?.message ?? 'unknown error' };
    }
}

export const getOrders = withSentryAction('getOrders', withAuth(getOrdersHandler));
