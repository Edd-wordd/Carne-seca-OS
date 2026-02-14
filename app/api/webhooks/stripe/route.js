import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    // 1. Get the raw body as text for signature verification
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature');

    let event;

    try {
        // 2. Verify the event actually came from Stripe
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`❌ Webhook Error: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // 3. Handle the 'Success' event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const supabase = await createClient();
        const guestId = session.metadata?.guest_id;

        console.log(`🔔 Payment successful for Guest: ${guestId}`);

        // --- FULFILLMENT LOGIC ---

        // A. Clear the cart (This is the 'Source of Truth' update)
        const { error: cartError } = await supabase.from('cart_items').delete().eq('guest_id', guestId);

        if (cartError) {
            console.error('Failed to clear cart:', cartError);
            // We return a 500 so Stripe retries the webhook later
            return new Response('Error clearing cart', { status: 500 });
        }

        // B. Optional: Create an 'orders' record here
        // using the session data (customer email, total, etc.)
    }

    return new Response('Success', { status: 200 });
}
