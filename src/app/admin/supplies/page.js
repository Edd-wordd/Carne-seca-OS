import { getSupplies } from '@/lib/supabase/queries/getSupplies';
import SuppliesClient from './_components/SuppliesClient';

export default async function SuppliesPage() {
    const supplies = await getSupplies();
    return <SuppliesClient initialSupplies={supplies ?? []} />;
}
