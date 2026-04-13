'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function updateOrderHandler({ orderId, customer, email, source, address, fulfillment, tracking }) {
    const supabase = await createClient();

    try {
        if (!orderId) return { success: false, message: 'Order ID is required' };
        if (!customer) return { success: false, message: 'Customer name is required' };
        if (!email) return { success: false, message: 'Customer needs to have an email' };

        const { error } = await supabase
            .from('orders')
            .update({
                customer_name: customer,
                customer_email: email,
                source,
                shipping_address: address,
                fulfillment_status: fulfillment,
                tracking_number: tracking,
            })
            .eq('id', orderId)
            .select('id, customer_name, customer_email, source, shipping_address, fulfillment_status, tracking_number')
            .single();

        if (error) return { success: false, message: error?.message ?? 'Unable to update order' };
        return { success: true };
    } catch (error) {
        return { success: false, message: error?.message ?? 'unknown error' };
    }
}

export const updateOrder = withSentryAction('updateOrder', withAuth(updateOrderHandler));
