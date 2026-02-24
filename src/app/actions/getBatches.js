'use server';

import { createClient } from '@/lib/supabase/server';

export async function getBatches() {
    const supabase = await createClient();

    const { data, error } = await supabase.from('production_batches').select(`
    *,
    suppliers (
      name
    )
  `);

    if (error) {
        console.error('Came back error', error);
    }

    return data;
}
