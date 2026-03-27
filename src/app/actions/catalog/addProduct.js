'use server';

import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { withSentryAction } from '@/lib/sentry/with-sentry-action';

function makeFlavorAbbrev(flavor) {
    const cleaned = String(flavor ?? '')
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

function generateSku(flavor) {
    return `CP-${makeFlavorAbbrev(flavor)}-${makeRandomId(4)}`;
}

async function addProductHandler({
    imageURL,
    productName,
    flavor,
    description,
    costPerBag,
    priceDollars,
    size,
    launchDate,
    status,
    category,
}) {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('products')
            .insert({
                image_url: imageURL,
                name: productName,
                sku: generateSku(flavor),
                flavor: flavor,
                description: description,
                cost_per_bag: costPerBag,
                price_cents: Math.round(Number(priceDollars) * 100),
                size_grams: size ? Math.round(Number(size) * 28.3495) : null,
                launch_date: launchDate,
                status: status,
                category: category === 'merch' ? 'merch' : 'carne_seca',
            })
            .select('id, sku')
            .single();
        if (error || !data) {
            return { success: false, error: error?.message ?? 'Failed to add product' };
        }

        return { success: true, id: data.id, sku: data.sku };
    } catch (error) {
        return { success: false, error: error?.message ?? 'Unknown error' };
    }
}

export const addProduct = withSentryAction('addProduct', addProductHandler);
