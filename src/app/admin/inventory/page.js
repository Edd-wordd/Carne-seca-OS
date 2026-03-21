import { InventoryTable } from './_components/InventoryTable';
import { getProductionInventory } from '@/lib/supabase/queries/getProductionInventory';

function normalizeInventoryItem(row) {
    if (!row) return null;
    const product = row.products ?? {};
    return {
        id: String(row.product_id ?? row.id ?? ''),
        sku: row.sku ?? product.sku ?? '',
        name: row.name ?? product.name ?? '',
        stock: row.available ?? 0,
        reserved: row.reserved ?? 0,
        consignment: row.consignment ?? 0,
        lowThreshold: row.low_threshold ?? row.lowThreshold ?? 10,
        value: (row.available ?? 0) * ((row.products?.price_cents ?? 0) / 100),
        costPerBag: row.cost_per_bag ?? row.costPerBag,
        sellPrice: row.sell_price ?? row.sellPrice,
    };
}

export default async function InventoryPage() {
    const data = await getProductionInventory();
    const rows = Array.isArray(data) ? data : data?.success === false ? [] : (data?.data ?? []);
    const initialInventory = rows.map(normalizeInventoryItem).filter(Boolean);

    return <InventoryTable initialInventory={initialInventory} />;
}
