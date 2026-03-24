'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';

async function getProductsHandler() {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase.from('products').select('*');
        return data;
    } catch (error) {
        if (error) {
            console.error('no products', error);
            return { success: false, message: 'no products' };
        }
    }
}

export const getProducts = withSentryAction('getProducts', getProductsHandler);
