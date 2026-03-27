'use server';

import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';

function makeNameAbbrev(name) {
    const cleaned = String(name ?? '')
        .trim()
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .toUpperCase();
    if (!cleaned) return 'GEN';

    const words = cleaned.split(' ').filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 3).padEnd(3, 'X');

    return words
        .map((w) => w[0])
        .join('')
        .slice(0, 3)
        .padEnd(3, 'X');
}

function makeRandomId(length = 4) {
    return randomUUID().replace(/-/g, '').slice(0, length).toUpperCase();
}

function generateSku(name) {
    return `CP-${makeNameAbbrev(name)}-${makeRandomId(4)}`;
}

async function addInventoryHandler({ name, stock, lowThreshold, consignment, costToAcquire, sellPrice }) {
    const supabase = await createClient();

    try {
        const { data: product, error: productError } = await supabase
            .from('products')
            .insert({
                sku: generateSku(name),
                name,
                cost_per_bag: costToAcquire,
                price_cents: Math.round(Number(sellPrice) * 100),
                category: 'merch',
            })
            .select('id')
            .single();

        if (productError || !product) {
            return { success: false, error: productError?.message ?? 'Failed to create product' };
        }

        const { error: inventoryError } = await supabase.from('production_inventory').insert({
            product_id: product.id,
            available: stock,
            consignment: consignment ?? 0,
            low_threshold: lowThreshold ?? 10,
        });

        if (inventoryError) {
            return { success: false, error: inventoryError.message };
        }

        return { success: true };
    } catch (err) {
        return { success: false, error: err?.message ?? 'Unknown error' };
    }
}

export const addInventory = withSentryAction('addInventory', addInventoryHandler);
