import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatPrice(priceInCents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(priceInCents / 100);
}

export function formatCurrency(n) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(n ?? 0);
}

export function formatDate(d) {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime())
        ? d
        : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function escapeCsv(val) {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

export function isProcessingStatus(status) {
    if (!status) return false;
    const s = String(status).toLowerCase();
    return s === 'pending' || s === 'processing' || s === 'partial_damaged' || s === 'partial';
}

export function isDamagedStatus(status) {
    if (!status) return false;
    const s = String(status).toLowerCase();
    return s === 'damaged' || s === 'full_damaged';
}

export function getStatusConfig(status) {
    if (status == null || status === '') {
        return { label: '—', className: 'text-zinc-500' };
    }
    const s = String(status).toLowerCase();
    if (isProcessingStatus(status)) {
        return { label: 'Processing', className: 'text-amber-400' };
    }
    if (s === 'damaged' || s === 'full_damaged') {
        return { label: 'Damaged', className: 'text-red-400' };
    }
    if (s === 'finished' || s === 'completed') {
        return { label: 'Finished', className: 'text-emerald-400' };
    }
    const label = s.charAt(0).toUpperCase() + s.slice(1);
    return { label, className: 'text-zinc-400' };
}

export function getYieldBadgeConfig(yieldDecimal) {
    if (yieldDecimal === null || yieldDecimal === undefined) {
        return {
            label: '—',
            className: 'border-zinc-600/30 bg-zinc-600/10 text-zinc-500',
        };
    }
    const yieldPercent = Math.round(yieldDecimal * 100);
    if (yieldPercent >= 40) {
        return {
            label: `${yieldPercent}%`,
            className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        };
    }
    if (yieldPercent >= 30) {
        return {
            label: `${yieldPercent}%`,
            className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
        };
    }
    return {
        label: `${yieldPercent}%`,
        className: 'border-red-500/30 bg-red-500/10 text-red-400',
    };
}

/** Supabase `orders` + nested `order_items` (also accepts legacy mock field names). */
export function normalizeOrderFromDb(row) {
    if (!row) return null;

    const orderItemsRaw = row.order_items ?? row.lineItems ?? [];
    const order_items = (Array.isArray(orderItemsRaw) ? orderItemsRaw : []).map((li) => ({
        id: li.id,
        product_id: li.product_id,
        quantity: li.quantity ?? 0,
        price_at_purchase: Math.round(Number(li.price_at_purchase ?? li.unitPriceCents ?? 0)),
        product_name: String(li.product_name ?? li.name ?? 'Item').trim() || 'Item',
    }));

    const itemsFromLines = order_items.reduce((s, li) => s + (li.quantity ?? 0), 0);
    const rawAddr = row.shipping_address ?? row.address;
    const shipping_address = normalizeShippingAddress(
        rawAddr && typeof rawAddr === 'string' ? tryParseJson(rawAddr) : rawAddr,
    );

    const status = row.status ?? 'pending';
    const sLower = String(status).toLowerCase();

    const id = row.id;
    const order_number = row.order_number != null && row.order_number !== '' ? String(row.order_number) : null;

    return {
        id,
        order_number,
        customer_name: String(row.customer_name ?? row.customer ?? '').trim(),
        customer_email: String(row.customer_email ?? row.email ?? '').trim(),
        created_at: row.created_at ?? row.date ?? '',
        fulfillment_status: normalizeFulfillmentStatus(row.fulfillment_status ?? row.fulfillment),
        tracking_number: String(row.tracking_number ?? row.tracking ?? '').trim(),
        amount_total: Math.round(Number(row.amount_total ?? row.total ?? 0)),
        shipping_address,
        order_items,
        status,
        source: row.source === 'pos' ? 'pos' : 'website',
        refunded: row.refunded === true || sLower === 'refunded',
        items: Number(row.items) || itemsFromLines,
        stripe_payment_intent_id: row.stripe_payment_intent_id ?? null,
        amount_discount: Math.round(Number(row.amount_discount ?? row.discountCents ?? 0)),
        promo_code: String(row.promo_code ?? row.promoCode ?? '').trim(),
    };
}

export function normalizeFulfillmentStatus(f) {
    return f === 'processing' ? 'unfulfilled' : (f ?? 'unfulfilled');
}

export function normalizeShippingAddress(raw) {
    if (!raw || typeof raw !== 'object') {
        return { line1: '', line2: '', city: '', state: '', zip: '', country: '' };
    }
    return {
        line1: String(raw.line1 ?? raw.address_line1 ?? '').trim(),
        line2: String(raw.line2 ?? raw.address_line2 ?? '').trim(),
        city: String(raw.city ?? '').trim(),
        state: String(raw.state ?? '').trim(),
        zip: String(raw.zip ?? raw.postal_code ?? '').trim(),
        country: String(raw.country ?? '').trim(),
    };
}

export function tryParseJson(s) {
    try {
        return JSON.parse(s);
    } catch {
        return null;
    }
}
