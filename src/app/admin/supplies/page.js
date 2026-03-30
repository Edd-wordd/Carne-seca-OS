import { getSupplies } from '@/lib/supabase/queries/getSupplies';
import { getSupplyPurchases } from '@/lib/supabase/queries/getSupplyPurchases';
import { getSuppliers } from '@/lib/supabase/queries/getSuppliers';
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
        lastPurchasedAt: row.last_purchase_date ?? row.lastPurchasedAt ?? null,
        purchasedFrom: row.purchased_from ?? row.purchasedFrom ?? '—',
        purchasedBy: row.purchased_by ?? row.purchasedBy ?? '—',
        quantity: row.quantity,
        weight: row.weight,
        unitCost: row.unit_cost ?? row.unitCost,
        value: row.value ?? null,
        paymentMethod: row.payment_method ?? row.paymentMethod,
    };
}

function normalizeSupplier(row) {
    if (!row) return null;
    const supplierId = row.supplier_id ?? row.id;
    if (supplierId == null || supplierId === '') return null;
    return { supplier_id: String(supplierId), name: row.name ?? '' };
}

function normalizePurchase(row) {
    if (!row) return null;
    const unit = parseFloat(row.unit_cost ?? row.unitCost);
    const qty = parseFloat(row.quantity);
    const cost = Number.isFinite(unit) && Number.isFinite(qty) ? unit * qty : null;
    return {
        id: String(row.purchase_id ?? ''),
        supplyId: String(row.id ?? row.supply_id ?? row.supplyId ?? ''),
        name: row.name ?? '',
        category: row.category ?? '',
        date: row.date ?? row.purchase_date ?? null,
        quantity: row.quantity,
        unit_cost: row.unit_cost ?? row.unitCost,
        cost,
        purchasedFrom: row.supplier_name ?? row.purchased_from ?? row.purchasedFrom ?? '—',
        paymentMethod: row.payment_method ?? row.paymentMethod,
        purchasedBy: row.purchased_by ?? row.purchasedBy ?? '—',
    };
}

export default async function SuppliesPage() {
    const [suppliesData, purchasesData, suppliersData] = await Promise.all([
        getSupplies(),
        getSupplyPurchases(),
        getSuppliers(),
    ]);
    const rawSupplies = Array.isArray(suppliesData) ? suppliesData : [];
    const rawPurchases = Array.isArray(purchasesData) ? purchasesData : [];
    const rawSuppliersList = Array.isArray(suppliersData) ? suppliersData : [];
    const supplies = rawSupplies.map(normalizeSupply).filter(Boolean);
    const purchases = rawPurchases.map(normalizePurchase).filter(Boolean);
    const suppliers = rawSuppliersList.map(normalizeSupplier).filter(Boolean);
    return (
        <SuppliesClient initialSupplies={supplies} initialPurchaseHistory={purchases} initialSuppliers={suppliers} />
    );
}
