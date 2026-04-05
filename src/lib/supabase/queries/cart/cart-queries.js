import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic'; // Add this at the top of the file
import { cookies } from 'next/headers';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';

async function getCartCountHandler() {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const guestId = cookieStore.get('guest_id')?.value;
    try {
        if (!guestId) return 0;

        const { data, error } = await supabase.from('cart_items').select('quantity').eq('guest_id', guestId);
        return data.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
    } catch (error) {
        if (error || !data) return 0;
    }
    // Sum all the quantities in the cart for the guest
}

export const getCartCount = withSentryAction('getCartCount', getCartCountHandler);
// get cart items for the current user, joined with products
async function getCartItemsHandler() {
    try {
        const supabase = await createClient();
        const cookieStore = await cookies();
        const guestId = cookieStore.get('guest_id')?.value;
        if (!guestId) return [];

        const { data, error } = await supabase
            .from('cart_items')
            .select('*, product:products(*)')
            .eq('guest_id', guestId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching cart items:', error);
            return [];
        }
        return data || [];
    } catch (err) {
        console.error('getCartItems error:', err);
        return [];
    }
}

export const getCartItems = withSentryAction('getCartItems', getCartItemsHandler);
