import { getSupplies } from '@/lib/supabase/queries/getSupplies';
import { getSupplyPurchases } from '@/lib/supabase/queries/getSupplyPurchases';
import SuppliesClient from './_components/SuppliesClient';

export default async function SuppliesPage() {
    const [suppliesData, purchasesData] = await Promise.all([getSupplies(), getSupplyPurchases()]);
    const supplies = Array.isArray(suppliesData) ? suppliesData : [];
    const purchases = Array.isArray(purchasesData) ? purchasesData : [];
    return <SuppliesClient initialSupplies={supplies} initialPurchaseHistory={purchases} />;
}
