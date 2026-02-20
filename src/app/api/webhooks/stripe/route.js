import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
);

export async function POST(req) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature');

    let event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`❌ Webhook Signature Verification Failed: ${err.message}`);
        return new Response(`Webhook Error`, { status: 400 });
    }

    // Define session AFTER event is verified
    const session = event.data.object;
    const guestId = session.metadata?.guest_id;
    const db_coupon_id = session.metadata?.db_coupon_id;

    switch (event.type) {
        case 'checkout.session.completed':
            console.log(`🔔 Processing Completion: ${session.id}`);

            const { data: existingOrder } = await supabaseAdmin
                .from('orders')
                .select('id')
                .eq('stripe_session_id', session.id)
                .maybeSingle();

            if (existingOrder) {
                return new Response('Order already processed', { status: 200 });
            }

            const { error: fulfillError } = await supabaseAdmin.rpc('fulfill_order', {
                p_guest_id: guestId || null,
                p_stripe_session_id: session.id,
                p_customer_email: session.customer_details?.email,
                p_amount_total: session.amount_total,
                p_coupon_id: db_coupon_id || null,
            });

            if (fulfillError) {
                console.error('Fulfillment Error:', fulfillError);
                return new Response('Internal Error', { status: 500 });
            }

            // THIS CLEARS THE "7" IN YOUR HUD
            revalidatePath('/', 'layout');
            break;

        case 'checkout.session.expired':
            if (!guestId) break;
            const { data: itemsToRelease } = await supabaseAdmin
                .from('cart_items')
                .select('product_id, quantity')
                .eq('guest_id', guestId);

            if (itemsToRelease && itemsToRelease.length > 0) {
                await supabaseAdmin.rpc('release_stock_bulk', {
                    items_to_release: itemsToRelease,
                });
            }
            break;
    }

    return new Response('Success', { status: 200 });
}
