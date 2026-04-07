'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';
import { withAuth } from '@/lib/clerk/with-auth';

async function getProductsHandler() {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) return { success: false, error: error.message };
        return { success: true, data: data ?? [] };
    } catch (error) {
        return { success: false, error: error?.message ?? 'Unknown error' };
    }
}

export const getProducts = withSentryAction('getProducts', withAuth(getProductsHandler));
