'use server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { getCartItems } from '@/lib/supabase/queries';

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

    const itemsForRpc = cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
    }));

    try {
        // Calculate total price
        for (const item of cartItems) {
            totalPrice += item.product.price_cents * item.quantity;
        }

        // Call the RPC once with all items
        const { error: rpcError } = await supabase.rpc('reserve_stock_bulk', {
            items: itemsForRpc,
        });
        if (rpcError) throw new Error(`STOCK_ERROR: ${rpcError.message}`);

        // ═══════════════════════════════════════════════════════════════════
        // STRIPE LOGIC — Place your Stripe Checkout Session creation here.
        // ═══════════════════════════════════════════════════════════════════
        const session = await stripe.checkout.sessions.create({
            line_items: cartItems.map((item) => ({
                price_data: {
                    currency: 'usd',
                    product_data: { name: item.product.name },
                    unit_amount: item.product.price_cents,
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/cart`,
            metadata: {
                guest_id: guestId,
            },
        });

        return { success: true, url: session.url };
    } catch (err) {
        console.error('Checkout Error:', err.message);
        if (!err.message.includes('STOCK_ERROR')) {
            await supabase.rpc('release_stock_bulk', {
                items_to_release: itemsForRpc,
            });
        }

        return { success: false, error: err.message };
    }
}
