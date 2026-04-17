'use server';

import { Shippo } from 'shippo';
import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

const shippo = new Shippo({ apiKeyHeader: process.env.SHIPPO_TEST_API_KEY });
async function getShippingRatesHandler({ orderId, weightOz }) {
    const supabase = await createClient();

    if (!orderId) return { success: false, message: 'Order ID is required' };
    if (!Number.isFinite(Number(weightOz)) || Number(weightOz) <= 0) {
        return { success: false, message: 'Valid package weight is required' };
    }

    // Fetch order to get shipping address
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, shipping_address, customer_name, customer_email')
        .eq('id', orderId)
        .maybeSingle();

    if (orderError) return { success: false, message: orderError.message };
    if (!order) return { success: false, message: 'Order not found' };
    if (!order.shipping_address?.line1) {
        return { success: false, message: 'Order has no shipping address' };
    }

    try {
        const shipment = await shippo.shipments.create({
            addressFrom: {
                name: process.env.SHIPPO_FROM_NAME,
                street1: process.env.SHIPPO_FROM_STREET1,
                city: process.env.SHIPPO_FROM_CITY,
                state: process.env.SHIPPO_FROM_STATE,
                zip: process.env.SHIPPO_FROM_ZIP,
                country: process.env.SHIPPO_FROM_COUNTRY,
                phone: process.env.SHIPPO_FROM_PHONE,
            },
            addressTo: {
                name: order.customer_name,
                street1: order.shipping_address.line1,
                street2: order.shipping_address.line2 ?? '',
                city: order.shipping_address.city,
                state: order.shipping_address.state,
                zip: order.shipping_address.zip,
                country: order.shipping_address.country || 'US',
                email: order.customer_email,
            },
            parcels: [
                {
                    length: '10',
                    width: '8',
                    height: '4',
                    distanceUnit: 'in',
                    weight: String(weightOz),
                    massUnit: 'oz',
                },
            ],
            async: false,
        });

        const rates = shipment.rates.map((r) => ({
            objectId: r.objectId,
            carrier: r.provider,
            service: r.servicelevel?.name,
            price: r.amount,
            currency: r.currency,
            days: r.estimatedDays,
        }));

        return { success: true, data: { shipmentId: shipment.object_id, rates } };
    } catch (error) {
        return { success: false, message: error?.message ?? 'Failed to get shipping rates' };
    }
}

export const getShippingRates = withSentryAction('getShippingRates', withAuth(getShippingRatesHandler));
