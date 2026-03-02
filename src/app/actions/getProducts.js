'use server';

import { createClient } from '@/lib/supabase/server';

export async function getProducts() {
    const supabase = await createClient();

    const { data, error } = await supabase.from('products').select('*');
    if (error) {
        console.error('no products', error);
        return { success: false, message: 'no products' };
    }
    return data;
}
