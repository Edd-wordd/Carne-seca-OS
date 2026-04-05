import { getBatches } from '@/lib/supabase/queries/production/getBatches';
import { getSuppliers } from '@/lib/supabase/queries/supplies/getSuppliers';
import { getProducts } from '@/lib/supabase/queries/catalog/getProducts';
import { ProductionClient, ProductionToolbar } from './_components/ProductionClient';

function normalizeBatches(data) {
    if (Array.isArray(data)) return data;
    return [];
}

function normalizeProducts(data) {
    if (Array.isArray(data)) return data;
    return [];
}

export default async function ProductionPage() {
    const [batchesRaw, suppliersRaw, productsRaw] = await Promise.all([
        getBatches(),
        getSuppliers(),
        getProducts(),
    ]);

    const initialBatches = normalizeBatches(batchesRaw);
    const initialSuppliers = Array.isArray(suppliersRaw) ? suppliersRaw : [];
    const initialProducts = normalizeProducts(productsRaw);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-zinc-100 text-xl font-semibold tracking-tight">Production Command Center</h1>
                    <p className="text-zinc-500 mt-1 text-sm">
                        Real-time operations visibility & batch management
                    </p>
                </div>
                <ProductionToolbar suppliers={initialSuppliers} />
            </div>

            <ProductionClient initialBatches={initialBatches} initialProducts={initialProducts} />
        </div>
    );
}
