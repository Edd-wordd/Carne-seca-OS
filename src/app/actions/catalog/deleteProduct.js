'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';

async function deleteProductHandler(productId) {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase.from('products').delete().eq('id', productId);

        if (error) return { success: false, message: error.message };
        return { success: true };
    } catch (error) {
        if (error) return { success: false, message: error?.message ?? 'unknown error' };
    }
}

export const deleteProduct = withSentryAction('deleteProduct', deleteProductHandler);
