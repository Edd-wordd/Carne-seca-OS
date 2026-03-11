'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export default async function updateCartQuantity(cartItemID, newQuantity) {
    const supabase = await createClient();
    const cookieStore = await cookies();

    const guestId = cookieStore.get('guest_id')?.value;
    console.log('cartItemID', cartItemID);
    console.log('newQuantity', newQuantity);
    console.log('guestId', guestId);

    if (!guestId) {
        console.error('No guest UUID found in cookies');
        return { success: false, error: 'No guest UUID found in cookies' };
    }

    if (!cartItemID) {
        console.error('No cart item ID found');
        return { success: false, error: 'No cart item ID found' };
    }

    if (newQuantity <= 0) {
        const { error } = await supabase.from('cart_items').delete().eq('id', cartItemID).eq('guest_id', guestId);
        if (error) {
            console.error('Error deleting cart item:', error);
            return { success: false, error: 'Error deleting cart item' };
        }
        revalidatePath('/cart');
        return { success: true, message: 'Cart item quantity set to 0' };
    } else {
        const { error } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('id', cartItemID)
            .eq('guest_id', guestId);
        if (error) {
            console.error('Error updating cart quantity:', error);
            return { success: false, error: 'Error updating cart quantity' };
        }
        revalidatePath('/cart');
        return { success: true, message: 'Cart quantity updated successfully' };
    }
}
