'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function deleteProductHandler(productId) {
    const supabase = await createClient();

    try {
        const { error } = await supabase.from('products').delete().eq('id', productId);

        if (error) return { success: false, message: error?.message ?? 'Failed to delete Product' };
        return { success: true };
    } catch (error) {
        return { success: false, message: error?.message ?? 'unknown error' };
    }
}

export const deleteProduct = withSentryAction('deleteProduct', withAuth(deleteProductHandler));
