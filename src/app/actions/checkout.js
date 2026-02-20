'use server';

import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { getCartItems } from '@/lib/supabase/queries';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function checkout() {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const guestId = cookieStore.get('guest_id')?.value;
    const cartItems = await getCartItems();

    let totalPrice = 0;

    if (!guestId) {
        console.error('No guest UUID found in cookies');
        return { success: false, error: 'No guest UUID found in cookies' };
    }

    if (cartItems.length === 0 || !cartItems) {
        return { success: false, error: 'No cart items found' };
    }

    // const itemsForRpc = cartItems.map((item) => ({
    //     product_id: item.product.id,
    //     quantity: item.quantity,
    // }));
    const itemsForRpc = cartItems.map((item) => ({
        product_id: String(item.product.id), // Force string UUID
        quantity: Number(item.quantity), // Force integer
    }));

    console.log('DEBUG RPC PAYLOAD:', JSON.stringify(itemsForRpc));

    try {
        // 1. Get fresh prices from the source of truth
        const productIds = cartItems.map((item) => item.product_id);
        const { data: freshProducts, error: priceError } = await supabase
            .from('products')
            .select('id, price_cents, name')
            .in('id', productIds);

        if (priceError || !freshProducts) throw new Error('Could not verify prices.');

        // 2. Calculate total and build Stripe line items using FRESH data
        const lineItems = cartItems.map((item) => {
            const dbProduct = freshProducts.find((p) => p.id === item.product_id);
            if (!dbProduct) throw new Error(`Product ${item.product_id} no longer exists.`);

            // We use dbProduct.price_cents, NOT item.product.price_cents
            totalPrice += dbProduct.price_cents * item.quantity;

            return {
                price_data: {
                    currency: 'usd',
                    product_data: { name: dbProduct.name },
                    unit_amount: dbProduct.price_cents,
                },
                quantity: item.quantity,
            };
        });

        // 3. Reserve Stock
        const { error: rpcError } = await supabase.rpc('reserve_stock_bulk', {
            items_to_reserve: itemsForRpc,
        });
        if (rpcError) throw new Error(`STOCK_ERROR: ${rpcError.message}`);

        // 4. Create Stripe Session with the validated lineItems
        const session = await stripe.checkout.sessions.create({
            line_items: lineItems, // Use the pre-built array from Step 2
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/products`,
            metadata: { guest_id: guestId },
        });

        return { success: true, url: session.url };
    } catch (err) {
        if (!err.message.includes('STOCK_ERROR')) {
            await supabase.rpc('release_stock_bulk', {
                items_to_release: itemsForRpc,
            });
        }

        return { success: false, error: err.message };
    }
}
