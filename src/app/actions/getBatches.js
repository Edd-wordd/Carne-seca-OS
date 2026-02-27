'use server';

import { createClient } from '@/lib/supabase/server';

export async function getBatches() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('production_batches')
        .select(`
    *,
    suppliers (
      name
    )
  `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Came back error', error);
    }

    return data;
}
