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

    // Check if this product already exists in the guest's cart
    const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('product_id', productId)
        .eq('guest_id', guestId)
        .maybeSingle();

    if (existing) {
        // Product already in cart — increment quantity
        const { error } = await supabase
            .from('cart_items')
            .update({ quantity: (existing.quantity ?? 1) + 1 })
            .eq('id', existing.id);

        if (error) {
            console.error('Error updating cart item quantity:', error);
            return { success: false, message: 'Failed to update quantity' };
        }
    } else {
        // New product — insert with quantity 1
        const { error } = await supabase.from('cart_items').insert({
            product_id: productId,
            guest_id: guestId,
            user_id: null,
            quantity: 1,
        });

        if (error) {
            console.error('Error inserting cart item:', error);
            return { success: false, message: 'Failed to add item' };
        }
    }

    revalidatePath('/');
    return { success: true };
}
