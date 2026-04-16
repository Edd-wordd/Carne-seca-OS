'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

const VALID_FULFILLMENT = ['unfulfilled', 'shipped', 'delivered'];
const VALID_SOURCES = ['website', 'pos'];

async function createOrderHandler({ name, email, source, fulfillment, address, items }) {
    const supabase = await createClient();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (fulfillment && !VALID_FULFILLMENT.includes(fulfillment)) {
        return { success: false, message: 'Invalid fulfillment status' };
    }

    if (source && !VALID_SOURCES.includes(source)) {
        return { success: false, message: 'Invalid source' };
    }
    if (!name) return { success: false, message: 'Customer name is required' };
    if (!email) return { success: false, message: 'Customer needs to have an email' };
    if (name.length > 100) return { success: false, message: 'Customer name is too long' };
    if (email.length > 254) return { success: false, message: 'Email is too long' };
    if (!emailRegex.test(email)) return { success: false, message: 'Invalid email address' };
    if (!Array.isArray(items) || items.length === 0) {
        return { success: false, message: 'Order must have at least one item' };
    }
    if (items.length > 50) {
        return { success: false, message: 'Order cannot exceed 50 line items' };
    }
    for (const item of items) {
        if (!item.product_id) return { success: false, message: 'Each item must have a product ID' };
        if (!Number.isFinite(Number(item.quantity)) || Number(item.quantity) < 1) {
            return { success: false, message: 'Each item must have a quantity of at least 1' };
        }
    }
    if (source === 'website') {
        if (!address?.line1?.trim()) return { success: false, message: 'Address line 1 is required' };
        if (!address?.city?.trim()) return { success: false, message: 'City is required' };
        if (!address?.state?.trim()) return { success: false, message: 'State is required' };
        if (!address?.zip?.trim()) return { success: false, message: 'ZIP code is required' };
        if (!address?.country?.trim()) return { success: false, message: 'Country is required' };
    }

    try {
        const { data, error } = await supabase.rpc('create_manual_order', {
            p_customer_name: name,
            p_customer_email: email,
            p_source: source,
            p_fulfillment_status: fulfillment,
            p_shipping_address: address,
            p_line_items: items,
        });

        if (error) return { success: false, message: error?.message ?? 'Unable to create order' };
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error?.message ?? 'unknown error' };
    }
}

export const createOrder = withSentryAction('createOrder', withAuth(createOrderHandler));
