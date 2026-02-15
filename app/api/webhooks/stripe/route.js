import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const session = event.data.object;
const guestId = session.metadata?.guest_id;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
);

export async function POST(req) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature');
    const db_coupon_id = session.metadata?.db_coupon_id;

    let event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`❌ Webhook Signature Verification Failed: ${err.message}`);
        return new Response(`Webhook Error`, { status: 400 });
    }

    switch (event.type) {
        case 'checkout.session.completed':
            console.log(`🔔 Processing Completion: ${session.id}`);

            // 1. Idempotency Check (Fixed your .maybeSingle syntax)
            const { data: existingOrder } = await supabaseAdmin
                .from('orders')
                .select('id')
                .eq('stripe_session_id', session.id)
                .maybeSingle();

            if (existingOrder) {
                return new Response('Order already processed', { status: 200 });
            }
            if (!guestId) {
                console.error('❌ Critical Error: No guestId found in session metadata');
                return new Response('Missing Metadata', { status: 400 });
            }
            // 2. Atomic Fulfillment
            const { error: fulfillError } = await supabaseAdmin.rpc('fulfill_order', {
                p_guest_id: guestId,
                p_stripe_session_id: session.id,
                p_customer_email: session.customer_details?.email,
                p_amount_total: session.amount_total,
                p_coupon_id: db_coupon_id || null, // ADD THIS LINE
            });

            if (fulfillError) {
                console.error('Fulfillment Error:', fulfillError);
                return new Response('Internal Error', { status: 500 });
            }
            break;

        case 'checkout.session.expired':
            console.log(`💀 Session Expired: ${session.id}`);
            if (!guestId) break;

            // 1. Get items that were reserved
            const { data: itemsToRelease } = await supabaseAdmin
                .from('cart_items')
                .select('product_id, quantity')
                .eq('guest_id', guestId);

            if (itemsToRelease && itemsToRelease.length > 0) {
                // 2. Release them back to inventory
                const { error: releaseError } = await supabaseAdmin.rpc('release_stock_bulk', {
                    items_to_release: itemsToRelease,
                });

                if (releaseError) console.error('Release Error:', releaseError);
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return new Response('Success', { status: 200 });
}
