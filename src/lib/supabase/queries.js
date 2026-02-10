import { createClient } from './server';
export const dynamic = 'force-dynamic'; // Add this at the top of the file
import { cookies } from 'next/headers';

export async function getCartCount() {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const guestId = cookieStore.get('guest_id')?.value;

    if (!guestId) return 0;

    const { count } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('guest_id', guestId);

    return count ?? 0;
}

// get cart items for the current user, joined with products
export async function getCartItems() {
    try {
        const supabase = await createClient();
        const cookieStore = await cookies();
        const guestId = cookieStore.get('guest_id')?.value;
        if (!guestId) return [];

        const { data, error } = await supabase
            .from('cart_items')
            .select('*, product:products(*)')
            .eq('guest_id', guestId);

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
