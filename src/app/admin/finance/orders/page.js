import { OrdersClient } from './_components/OrdersClient';
import { getOrders } from '@/lib/supabase/queries/orders/getOrders';

function normalizeFulfillmentStatus(f) {
    return f === 'processing' ? 'unfulfilled' : (f ?? 'unfulfilled');
}

function normalizeShippingAddress(raw) {
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

function tryParseJson(s) {
    try {
        return JSON.parse(s);
    } catch {
        return null;
    }
}

/** Supabase `orders` + nested `order_items` (also accepts legacy mock field names). */
function normalizeOrderFromDb(row) {
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
    const order_number =
        row.order_number != null && row.order_number !== '' ? String(row.order_number) : null;

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

function normalizeOrders(data) {
    if (!Array.isArray(data)) return [];
    return data.map((row) => normalizeOrderFromDb(row)).filter(Boolean);
}

export default async function OrdersPage() {
    const result = await getOrders();
    const initialOrders = normalizeOrders(result?.data);
    return <OrdersClient initialOrders={initialOrders} />;
}
