'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import { exportCatalogToCsv } from '@/lib/utils/exportCatalog';
import { cn } from '@/lib/utils/helpers';
import { getProducts } from '@/lib/supabase/queries/getProducts';
import { addProduct } from '@/app/actions/catalog/addProduct';
import { updateProduct } from '@/app/actions/catalog/updateProduct';
import { deleteProduct } from '@/app/actions/catalog/deleteProduct';
import { toast } from 'sonner';
import CatalogKpis from './_components/CatalogKpis';
import CatalogTable from './_components/CatalogTable';
import CatalogProductDialog from './_components/CatalogProductDialog';
import CatalogDeleteDialog from './_components/CatalogDeleteDialog';

const CATALOG_PAGE_SIZE = 15;

const PRODUCT_CATEGORIES = [
    { value: 'carne_seca', label: 'Carne seca' },
    { value: 'merch', label: 'Merch' },
];

const getNormalizedStatus = (product) => String(product?.status ?? '').trim().toLowerCase();

export default function CatalogPage() {
    const [items, setItems] = React.useState([]);
    const [search, setSearch] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('all');
    const [addModalOpen, setAddModalOpen] = React.useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [deleteTarget, setDeleteTarget] = React.useState(null);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [editingId, setEditingId] = React.useState(null);
    const [catalogPage, setCatalogPage] = React.useState(1);
    const [form, setForm] = React.useState({
        name: '',
        flavor: '',
        description: '',
        price: '',
        costPerBag: '',
        status: 'active',
        imageUrl: '',
        launchDate: '',
        size: '',
        category: 'carne_seca',
    });

    const resetForm = () => {
        setForm({
            name: '',
            flavor: '',
            description: '',
            price: '',
            costPerBag: '',
            status: 'active',
            imageUrl: '',
            launchDate: '',
            size: '',
            category: 'carne_seca',
        });
        setEditingId(null);
    };

    /** Defer reset until after close animation so the header does not flash "Add Product" while exiting edit. */
    const closeResetTimeoutRef = React.useRef(null);
    const clearPendingCloseReset = () => {
        if (closeResetTimeoutRef.current != null) {
            clearTimeout(closeResetTimeoutRef.current);
            closeResetTimeoutRef.current = null;
        }
    };
    const scheduleResetAfterClose = () => {
        clearPendingCloseReset();
        closeResetTimeoutRef.current = setTimeout(() => {
            resetForm();
            closeResetTimeoutRef.current = null;
        }, 250);
    };

    useEffect(() => {
        getProducts().then(setItems);
    }, []);

    useEffect(() => () => clearPendingCloseReset(), []);

    const requestDeleteProduct = (p) => {
        setDeleteTarget(p);
        setDeleteModalOpen(true);
    };

    const handleDeleteProduct = async () => {
        if (!deleteTarget?.id || isDeleting) return;
        setIsDeleting(true);
        const result = await deleteProduct(deleteTarget.id);
        if (result && result.success) {
            setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
            setDeleteModalOpen(false);
            setDeleteTarget(null);
        } else {
            const errorMessage = String(result?.message ?? '').toLowerCase();
            const isForeignKeyError =
                errorMessage.includes('foreign key') ||
                errorMessage.includes('violates foreign key constraint') ||
                errorMessage.includes('is still referenced');
            if (isForeignKeyError) {
                const sizeInOunces = deleteTarget.size_grams
                    ? (Number(deleteTarget.size_grams) / 28.3495).toFixed(1)
                    : null;
                const updateResult = await updateProduct({
                    productID: deleteTarget.id,
                    imageURL: deleteTarget.image ?? deleteTarget.image_url ?? null,
                    productName: deleteTarget.name ?? 'Untitled',
                    flavor: deleteTarget.flavor ?? null,
                    description: deleteTarget.description ?? null,
                    costPerBag: deleteTarget.cost_per_bag ?? null,
                    priceDollars: Number(deleteTarget.price_cents ?? 0) / 100,
                    size: sizeInOunces,
                    launchDate: deleteTarget.launchDate ?? deleteTarget.launch_date ?? null,
                    category: deleteTarget.category === 'merch' ? 'merch' : 'carne_seca',
                    status: 'inactive',
                });

                if (updateResult && updateResult.success) {
                    setItems((prev) =>
                        prev.map((item) =>
                            item.id === deleteTarget.id ? { ...item, status: 'inactive' } : item,
                        ),
                    );
                    setDeleteModalOpen(false);
                    setDeleteTarget(null);
                    toast.success('Product has inventory records - moved to Hidden.');
                } else {
                    toast.error(updateResult?.message || 'Failed to hide product.');
                }
            } else {
                toast.error(result?.message || 'Failed to delete product.');
            }
        }
        setIsDeleting(false);
    };

    const openEdit = (p) => {
        clearPendingCloseReset();
        const firstSize = p.size_grams ? (p.size_grams / 28.3495).toFixed(1) : '';
        setForm({
            name: p.name ?? '',
            flavor: p.flavor ?? '',
            description: p.description ?? '',
            price: p.price_cents != null ? (p.price_cents / 100).toFixed(2) : '',
            costPerBag: p.cost_per_bag != null ? String(p.cost_per_bag) : '',
            status: p.status ?? 'active',
            imageUrl: p.image ?? p.image_url ?? '',
            launchDate: p.launchDate ?? p.launch_date ?? '',
            size: firstSize ?? '',
            category: p.category === 'merch' ? 'merch' : 'carne_seca',
        });
        setEditingId(p.id);
        setAddModalOpen(true);
    };

    const handleSubmitProduct = async (e) => {
        e.preventDefault();
        const priceDollars = parseFloat(form.price) || 0;
        const price_cents = Math.round(priceDollars * 100);
        const cost_per_bag = parseFloat(form.costPerBag) || null;
        const productName = form.name.trim() || 'Untitled';
        const existing = editingId ? items.find((i) => i.id === editingId) : null;

        const rowShape = {
            name: productName,
            sku: existing?.sku ?? null,
            flavor: form.flavor.trim() || null,
            price_cents,
            cost_per_bag,
            status: form.status,
            description: form.description.trim() || null,
            image: form.imageUrl.trim() || null,
            image_url: form.imageUrl.trim() || null,
            launch_date: form.launchDate.trim() || null,
            sizes: form.size.trim() ? [form.size.trim()] : (existing?.sizes ?? []),
            category: form.category === 'merch' ? 'merch' : 'carne_seca',
            platforms: existing?.platforms ?? ['website'],
            stock: existing?.stock ?? 0,
        };

        if (editingId) {
            const updateResult = await updateProduct({
                productID: editingId,
                imageURL: form.imageUrl.trim() || null,
                productName,
                flavor: form.flavor.trim() || null,
                description: form.description.trim() || null,
                costPerBag: cost_per_bag,
                priceDollars,
                size: form.size.trim() || null,
                launchDate: form.launchDate.trim() || null,
                category: rowShape.category,
                status: form.status,
            });

            if (!updateResult || updateResult.success === false) {
                alert(updateResult?.message ?? 'Failed to update product.');
                return;
            }

            setItems((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...rowShape } : p)));
            setAddModalOpen(false);
            return;
        }

        const result = await addProduct({
            productName,
            flavor: form.flavor.trim() || null,
            description: form.description.trim() || null,
            costPerBag: cost_per_bag,
            priceDollars,
            imageURL: form.imageUrl.trim() || null,
            launchDate: (form.launchDate || '').trim(),
            size: form.size.trim() || null,
            status: form.status,
            category: rowShape.category,
        });

        if (!result || result.success === false) {
            alert(result?.error ?? 'Failed to save product.');
            return;
        }

        const numericIds = items.map((p) => parseInt(String(p.id), 10)).filter((n) => !Number.isNaN(n));
        const fallbackId = String(Math.max(0, ...numericIds, 0) + 1);
        const newId = result.id != null ? String(result.id) : fallbackId;

        setItems((prev) => [{ id: newId, ...rowShape, sku: result?.sku ?? rowShape.sku }, ...prev]);
        setAddModalOpen(false);
    };

    const filtered = React.useMemo(() => {
        let list = items;
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter((p) => p.name.toLowerCase().includes(q));
        }
        if (statusFilter === 'active') {
            list = list.filter((p) => getNormalizedStatus(p) === 'active');
        } else if (statusFilter === 'inactive') {
            list = list.filter((p) => getNormalizedStatus(p) !== 'active');
        }
        return list;
    }, [items, search, statusFilter]);

    React.useEffect(() => setCatalogPage(1), [search, statusFilter]);

    const catalogTotalPages = Math.max(1, Math.ceil(filtered.length / CATALOG_PAGE_SIZE));
    const safeCatalogPage = Math.min(catalogPage, catalogTotalPages);
    const paginatedCatalog = filtered.slice(
        (safeCatalogPage - 1) * CATALOG_PAGE_SIZE,
        safeCatalogPage * CATALOG_PAGE_SIZE,
    );

    const activeCount = items.filter((p) => getNormalizedStatus(p) === 'active').length;

    const avgMargin = React.useMemo(() => {
        const withCost = items.filter((p) => p.price_cents > 0 && p.cost_per_bag != null);
        if (withCost.length === 0) return null;
        let sumPct = 0;
        let sumDollars = 0;
        withCost.forEach((p) => {
            const sellPrice = p.price_cents / 100;
            const cost = Number(p.cost_per_bag) || 0;
            sumDollars += sellPrice - cost;
            sumPct += sellPrice > 0 ? ((sellPrice - cost) / sellPrice) * 100 : 0;
        });
        return {
            dollars: sumDollars / withCost.length,
            pct: sumPct / withCost.length,
        };
    }, [items]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-zinc-100 text-lg font-semibold tracking-tight">Catalog</h1>
                    <p className="text-zinc-400 mt-0.5 text-xs">Add & manage products on your live website</p>
                </div>
                <Button
                    size="sm"
                    className="gap-1.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 w-fit"
                    onClick={() => {
                        clearPendingCloseReset();
                        resetForm();
                        setAddModalOpen(true);
                    }}
                >
                    <Plus className="size-3.5" />
                    Add Product
                </Button>
            </div>

            <CatalogKpis totalItems={items.length} activeCount={activeCount} avgMargin={avgMargin} />

            {/* Filters & Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
                        {[
                            { value: 'all', label: 'All' },
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Hidden' },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setStatusFilter(opt.value)}
                                className={cn(
                                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                                    statusFilter === opt.value
                                        ? 'bg-zinc-700 text-zinc-100'
                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50',
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                    onClick={() => exportCatalogToCsv(filtered)}
                >
                    <Download className="size-4" />
                    Export CSV
                </Button>
            </div>

            <CatalogTable
                filtered={filtered}
                paginatedCatalog={paginatedCatalog}
                search={search}
                setSearch={setSearch}
                openEdit={openEdit}
                requestDeleteProduct={requestDeleteProduct}
                safeCatalogPage={safeCatalogPage}
                catalogTotalPages={catalogTotalPages}
                setCatalogPage={setCatalogPage}
                catalogPageSize={CATALOG_PAGE_SIZE}
            />

            <CatalogProductDialog
                open={addModalOpen}
                setOpen={setAddModalOpen}
                editingId={editingId}
                clearPendingCloseReset={clearPendingCloseReset}
                scheduleResetAfterClose={scheduleResetAfterClose}
                form={form}
                setForm={setForm}
                productCategories={PRODUCT_CATEGORIES}
                handleSubmitProduct={handleSubmitProduct}
            />

            <CatalogDeleteDialog
                open={deleteModalOpen}
                setOpen={setDeleteModalOpen}
                deleteTarget={deleteTarget}
                isDeleting={isDeleting}
                setDeleteTarget={setDeleteTarget}
                handleDeleteProduct={handleDeleteProduct}
            />
        </div>
    );
}
