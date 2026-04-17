'use server';

import { Shippo } from 'shippo';
import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

const shippo = new Shippo({ apiKeyHeader: process.env.SHIPPO_TEST_API_KEY });
async function purchaseShippingLabelHandler({ orderId, rateObjectId }) {
    const supabase = await createClient();

    if (!orderId) return { success: false, message: 'Order ID is required' };
    if (!rateObjectId) return { success: false, message: 'Rate selection is required' };

    try {
        const transaction = await shippo.transactions.create({
            rate: rateObjectId,
            label_file_type: 'PDF',
            async: false,
        });

        if (transaction.status !== 'SUCCESS') {
            return {
                success: false,
                message: transaction.messages?.[0]?.text ?? 'Failed to purchase label',
            };
        }

        const { error: updateError } = await supabase
            .from('orders')
            .update({
                tracking_number: transaction.tracking_number,
                fulfillment_status: 'shipped',
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

        if (updateError) {
            return {
                success: false,
                message: `Label purchased but order could not be updated. Label URL: ${transaction.labelUrl} — Tracking: ${transaction.trackingNumber}. Please update the order manually.`,
                data: {
                    labelUrl: transaction.labelUrl,
                    trackingNumber: transaction.trackingNumber,
                },
            };
        }

        return {
            success: true,
            data: {
                labelUrl: transaction.label_url,
                trackingNumber: transaction.tracking_number,
                trackingUrl: transaction.tracking_url_provider,
            },
        };
    } catch (error) {
        return { success: false, message: error?.message ?? 'Failed to purchase label' };
    }
}

export const purchaseShippingLabel = withSentryAction('purchaseShippingLabel', withAuth(purchaseShippingLabelHandler));
