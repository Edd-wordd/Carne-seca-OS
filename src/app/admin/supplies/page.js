import { getSupplies } from '@/lib/supabase/queries/getSupplies';
import SuppliesClient from './_components/SuppliesClient';

export default async function SuppliesPage() {
    const data = await getSupplies();
    const supplies = Array.isArray(data) ? data : [];
    return <SuppliesClient initialSupplies={supplies} />;
}
