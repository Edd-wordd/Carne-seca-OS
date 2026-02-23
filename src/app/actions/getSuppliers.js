'use server';

import { createClient } from '@/lib/supabase/server';

export async function getSuppliers() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('suppliers')
        .select('supplier_id, name');

    if (error) {
        console.error('Failed to fetch suppliers:', error);
        return [];
    }

    return data ?? [];
}
