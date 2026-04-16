import { OrdersClient } from './_components/OrdersClient';
import { getOrders } from '@/lib/supabase/queries/orders/getOrders';
import { normalizeOrderFromDb } from '@/lib/utils/helpers';

function normalizeOrders(data) {
    if (!Array.isArray(data)) return [];
    return data.map((row) => normalizeOrderFromDb(row)).filter(Boolean);
}

export default async function OrdersPage() {
    const result = await getOrders();
    const initialOrders = normalizeOrders(result?.data);
    return <OrdersClient initialOrders={initialOrders} />;
}
