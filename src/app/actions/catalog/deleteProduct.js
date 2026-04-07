'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function deleteProductHandler(productId) {
    if (!productId) return { success: false, error: 'Product ID required' };

    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('products')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', productId)
            .select('id')
            .single();

        if (error || !data) return { success: false, error: error?.message ?? 'Product not found' };
        return { success: true };
    } catch (error) {
        return { success: false, error: error?.message ?? 'Unknown error' };
    }
}

export const deleteProduct = withSentryAction('deleteProduct', withAuth(deleteProductHandler));
