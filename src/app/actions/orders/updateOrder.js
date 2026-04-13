'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

const VALID_FULFILLMENT = ['unfulfilled', 'shipped', 'delivered'];
const VALID_SOURCES = ['website', 'pos'];

async function updateOrderHandler({ orderId, customer, email, source, address, fulfillment, tracking }) {
    const supabase = await createClient();

    if (fulfillment && !VALID_FULFILLMENT.includes(fulfillment)) {
        return { success: false, message: 'Invalid fulfillment status' };
    }

    if (source && !VALID_SOURCES.includes(source)) {
        return { success: false, message: 'Invalid source' };
    }
    if (!orderId) return { success: false, message: 'Order ID is required' };
    if (!customer) return { success: false, message: 'Customer name is required' };
    if (!email) return { success: false, message: 'Customer needs to have an email' };
    if (customer.length > 100) return { success: false, message: 'Customer name is too long' };
    if (email.length > 254) return { success: false, message: 'Email is too long' };
    if (tracking && tracking.length > 100) return { success: false, message: 'Tracking number is too long' };

    try {
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
