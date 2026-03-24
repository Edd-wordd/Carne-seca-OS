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
        costPerBag: row.products?.cost_per_bag ?? row.costPerBag,
        sellPrice: row.sell_price ?? row.sellPrice,
        category: row.products?.category ?? 'carne_seca',
    };
}

export default async function InventoryPage() {
    const data = await getProductionInventory();
    // data is expected to have { inventory, adjustmentsLog } if successful
    let inventoryRows = [];
    let adjustmentsLog = [];

    if (data && data.success !== false && typeof data === 'object' && data.inventory) {
        inventoryRows = data.inventory;
        adjustmentsLog = data.adjustmentsLog ?? [];
    }

    const initialInventory = (inventoryRows || []).map(normalizeInventoryItem).filter(Boolean);

    return <InventoryTable initialInventory={initialInventory} adjustmentsLog={adjustmentsLog} />;
}
