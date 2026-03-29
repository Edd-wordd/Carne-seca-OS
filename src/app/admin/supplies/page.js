import { getSupplies } from '@/lib/supabase/queries/getSupplies';
import { getSupplyPurchases } from '@/lib/supabase/queries/getSupplyPurchases';
import SuppliesClient from './_components/SuppliesClient';

function normalizeSupply(row) {
    if (!row) return null;
    return {
        id: String(row.id ?? ''),
        name: row.name ?? '',
        category: row.category ?? '',
        unit: row.unit ?? 'lb',
        description: row.description ?? '',
        lowThreshold: row.low_threshold ?? row.lowThreshold ?? null,
        lastPurchasedAt: row.purchase_date ?? row.lastPurchasedAt ?? null,
        purchasedFrom: row.purchased_from ?? row.purchasedFrom ?? '—',
        purchasedBy: row.purchased_by ?? row.purchasedBy ?? '—',
        quantity: row.quantity,
        weight: row.weight,
        unitCost: row.unit_cost ?? row.unitCost,
        value: row.value ?? null,
        paymentMethod: row.payment_method ?? row.paymentMethod,
    };
}

export default async function SuppliesPage() {
    const [suppliesData, purchasesData] = await Promise.all([getSupplies(), getSupplyPurchases()]);
    const rawSupplies = Array.isArray(suppliesData) ? suppliesData : [];
    const purchases = Array.isArray(purchasesData) ? purchasesData : [];
    const supplies = rawSupplies.map(normalizeSupply).filter(Boolean);
    return <SuppliesClient initialSupplies={supplies} initialPurchaseHistory={purchases} />;
}
