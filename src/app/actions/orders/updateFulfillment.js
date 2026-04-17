'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function updateFulfillmentHandler({ orderId, fulfillment }, _auth) {
    const supabase = await createClient();
    if (!orderId) return { success: false, message: 'Order ID is required' };
    if (!fulfillment) return { success: false, message: 'Fulfillment is required' };

    const nextFulfillment = String(fulfillment).toLowerCase();
    if (!['shipped', 'delivered'].includes(nextFulfillment)) {
        return { success: false, message: 'Invalid fulfillment value' };
    }

    try {
        const { data: exists, error: fetchError } = await supabase
            .from('orders')
            .select('id, fulfillment_status')
            .eq('id', orderId)
            .maybeSingle();

        if (fetchError) {
            return { success: false, message: fetchError?.message ?? 'Unable to load order' };
        }
        if (!exists) {
            return { success: false, message: 'Order not found' };
        }
        if (exists.fulfillment_status === nextFulfillment) {
            return { success: true };
        }

        const { data: updated, error: updatedError } = await supabase
            .from('orders')
            .update({ fulfillment_status: nextFulfillment, updated_at: new Date().toISOString() })
            .eq('id', orderId)
            .select('id')
            .maybeSingle();

        if (updatedError) {
            return { success: false, message: updatedError?.message ?? 'Unable update mark delivered' };
        }
        if (!updated) {
            return { success: false, message: 'Order not found' };
        }

        return { success: true };
    } catch (error) {
        return { success: false, message: error?.message ?? 'unknown error' };
    }
}

export const updateFulfillment = withSentryAction('updateFulfillment', withAuth(updateFulfillmentHandler));
