'use server';

import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';

async function getSuppliersHandler() {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase.from('suppliers').select('supplier_id, name');
        return data ?? [];
    } catch (error) {
        if (error) {
            console.error('Failed to fetch suppliers:', error);
            return [];
        }
    }
}

export const getSuppliers = withSentryAction('getSupplers', getSuppliersHandler);
