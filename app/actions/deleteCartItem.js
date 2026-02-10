'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export default async function deleteCartItem(cartItemID) {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const guestId = cookieStore.get('guest_id')?.value;
    if (!guestId) {
        console.error('No guest UUID found in cookies');
        return { success: false, error: 'No guest UUID found in cookies' };
    }
    const { error } = await supabase.from('cart_items').delete().eq('id', cartItemID).eq('guest_id', guestId);
    if (error) {
        console.error('Error deleting cart item:', error);
        return { success: false, error: 'Error deleting cart item' };
    }
    revalidatePath('/');
    return { success: true, message: 'Cart item deleted successfully' };
}
