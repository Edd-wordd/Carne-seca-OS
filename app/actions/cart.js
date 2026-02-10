'use server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addToCartAction(productId) {
    const cookieStore = await cookies();
    const guestId = cookieStore.get('guest_id')?.value;

    console.log('adding to cart for guestId:', guestId);

    if (!guestId) {
        return {
            success: false,
            message: 'Guest ID not found',
        };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.from('cart_items').insert({
        product_id: productId,
        guest_id: guestId,
    });
    if (error) {
        console.log('Error adding to cart:', error);
        return {
            success: false,
            message: 'Error adding to cart',
        };
    }
    revalidatePath('/');
    return {
        success: true,
        message: 'Item added to cart',
    };
}
