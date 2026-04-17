'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

/** First arg is the payload from the client; `withAuth` appends `{ userId }` as the second argument. */
async function markAsRefundedHandler({ orderId }, _auth) {
    const supabase = await createClient();

    if (!orderId) {
        return { success: false, message: 'Order ID is required' };
    }

    try {
        const { data: existing, error: fetchError } = await supabase
            .from('orders')
            .select('id, refunded')
            .eq('id', orderId)
            .maybeSingle();

        if (fetchError) {
            return { success: false, message: fetchError?.message ?? 'Unable to load order' };
        }
        if (!existing) {
            return { success: false, message: 'Order not found' };
        }
        if (existing.refunded === true) {
            return { success: true };
        }

        const { data: updated, error: updateError } = await supabase
            .from('orders')
            .update({ refunded: true, updated_at: new Date().toISOString() })
            .eq('id', orderId)
            .select('id')
            .maybeSingle();

        if (updateError) {
            return { success: false, message: updateError?.message ?? 'Unable to mark refunded' };
        }
        if (!updated) {
            return { success: false, message: 'Order not found' };
        }

        return { success: true };
    } catch (error) {
        return { success: false, message: error?.message ?? 'unknown error' };
    }
}

export const markAsRefunded = withSentryAction('markAsRefunded', withAuth(markAsRefundedHandler));
