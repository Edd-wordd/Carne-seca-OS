import { getProducts } from '@/lib/supabase/queries/catalog/getProducts';
import CatalogPage from './_components/CatalogPage';

export default async function Page() {
    const result = await getProducts();
    const initialProducts = result?.data ?? [];
    return <CatalogPage initialProducts={initialProducts} />;
}
