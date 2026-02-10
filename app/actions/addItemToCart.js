'use server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addItemToCart(productId) {
    const supabase = await createClient();
    const cookieStore = await cookies();

    // This is the UUID we assigned to the user's browser
    const guestId = cookieStore.get('guest_id')?.value;

    if (!guestId) {
        console.error('No guest UUID found in cookies');
        return { success: false };
    }

    const { error } = await supabase.from('cart_items').insert({
        product_id: productId,
        guest_id: guestId, // Map it here
        user_id: null, // Explicitly null since we aren't using login
    });

    if (!error) {
        revalidatePath('/', 'layout'); // Force the Navbar to see the change
        return { success: true };
    }
}
