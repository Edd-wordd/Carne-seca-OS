'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Package,
    Plus,
    Search,
    MoreHorizontal,
    Eye,
    EyeOff,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    Percent,
    Download,
    Pencil,
    Trash2,
} from 'lucide-react';
import { exportCatalogToCsv } from '@/lib/utils/exportCatalog';
import { cn } from '@/lib/utils/helpers';
import { getProducts } from '@/lib/supabase/queries/getProducts';
import { addProduct } from '@/app/actions/catalog/addProduct';
import { formatPrice, formatCurrency, formatDate } from '@/lib/utils/helpers';
import { updateProduct } from '@/app/actions/catalog/updateProduct';
import { deleteProduct } from '@/app/actions/catalog/deleteProduct';
import { toast } from 'sonner';

const CATALOG_PAGE_SIZE = 15;

const PRODUCT_CATEGORIES = [
    { value: 'carne_seca', label: 'Carne seca' },
    { value: 'merch', label: 'Merch' },
];

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
        sku: '',
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
            sku: '',
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
            toast.error(result?.message || 'Failed to delete product.');
        }
        setIsDeleting(false);
    };

    const openEdit = (p) => {
        clearPendingCloseReset();
        console.log(p.size_grams);
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
            SKU: form.sku.trim() || null,
            flavor: form.flavor.trim() || null,
            description: form.description.trim() || null,
            costPerBag: cost_per_bag,
            priceCents: priceDollars,
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

        setItems((prev) => [{ id: newId, ...rowShape }, ...prev]);
        setAddModalOpen(false);
    };

    const filtered = React.useMemo(() => {
        let list = items;
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter((p) => p.name.toLowerCase().includes(q));
        }
        if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter);
        return list;
    }, [items, search, statusFilter]);

    React.useEffect(() => setCatalogPage(1), [search, statusFilter]);

    const catalogTotalPages = Math.max(1, Math.ceil(filtered.length / CATALOG_PAGE_SIZE));
    const safeCatalogPage = Math.min(catalogPage, catalogTotalPages);
    const paginatedCatalog = filtered.slice(
        (safeCatalogPage - 1) * CATALOG_PAGE_SIZE,
        safeCatalogPage * CATALOG_PAGE_SIZE,
    );

    const activeCount = items.filter((p) => p.status === 'active').length;

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

            {/* Summary */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <Package className="size-4 shrink-0 text-indigo-400/80" />
                    <div className="min-w-0">
                        <p className="text-zinc-400 text-[10px]">Total Items</p>
                        <p className="text-zinc-100 text-sm font-semibold tabular-nums">{items.length}</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <Eye className="size-4 shrink-0 text-emerald-400/80" />
                    <div className="min-w-0">
                        <p className="text-zinc-400 text-[10px]">Active</p>
                        <p className="text-zinc-100 text-sm font-semibold tabular-nums">{activeCount}</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <EyeOff className="size-4 shrink-0 text-zinc-500" />
                    <div className="min-w-0">
                        <p className="text-zinc-400 text-[10px]">Hidden</p>
                        <p className="text-zinc-100 text-sm font-semibold tabular-nums">{items.length - activeCount}</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <Percent className="size-4 shrink-0 text-amber-400/80" />
                    <div className="min-w-0">
                        <p className="text-zinc-400 text-[10px]">Avg margin</p>
                        <p className="text-zinc-100 text-sm font-semibold tabular-nums">
                            {avgMargin != null
                                ? `${formatCurrency(avgMargin.dollars)} · ${avgMargin.pct.toFixed(1)}%`
                                : '—'}
                        </p>
                    </div>
                </div>
            </div>

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

            {/* Table */}
            <div className="overflow-hidden rounded border border-zinc-700/80">
                <div className="border-b border-zinc-700/80 bg-zinc-900/80 px-3 py-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-zinc-100 text-xs font-medium">Catalog Items</h2>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                            <Input
                                placeholder="Search catalog…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-7 w-[160px] border-zinc-700 bg-zinc-950 pl-8 text-[10px] text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                    </div>
                </div>
                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow className="border-zinc-700/80 hover:!bg-transparent">
                            <TableHead className="text-zinc-400 h-8 w-[5%] min-w-14 px-3 text-[10px]">Image</TableHead>
                            <TableHead className="text-zinc-400 h-8 w-[20%] px-3 text-[10px]">Flavor</TableHead>
                            <TableHead className="text-zinc-400 h-8 w-[15%] px-3 text-[10px] font-mono">SKU</TableHead>
                            <TableHead className="text-zinc-400 h-8 w-[12%] px-3 text-[10px] text-right">
                                Cost/Bag
                            </TableHead>
                            <TableHead className="text-zinc-400 h-8 w-[14%] pr-6 pl-3 text-[10px] text-right">
                                Sell Price
                            </TableHead>
                            <TableHead className="text-zinc-400 h-8 w-[16%] pl-6 pr-3 text-[10px]">
                                Launch date
                            </TableHead>
                            <TableHead className="text-zinc-400 h-8 w-[13%] px-3 text-[10px]">Status</TableHead>
                            <TableHead className="text-zinc-400 h-8 w-[5%] min-w-16 px-3 text-[10px] text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow className="border-zinc-700/80">
                                <TableCell colSpan={8} className="text-zinc-400 py-8 text-center text-[11px]">
                                    No catalog items match the filters
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedCatalog.map((p) => (
                                <TableRow
                                    key={p.id}
                                    className="group border-zinc-700/80 transition-colors hover:!bg-zinc-700/50"
                                >
                                    <TableCell className="px-3 py-1.5">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-zinc-700 bg-zinc-900/80">
                                            {p.image_url || p.image ? (
                                                <img
                                                    src={p.image_url || p.image}
                                                    alt={p.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <ImageIcon className="size-4 text-zinc-600" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-3 py-1.5">
                                        <p className="text-zinc-200 text-[11px] font-medium group-hover:text-zinc-100">
                                            {p.name}
                                        </p>
                                    </TableCell>
                                    <TableCell className="px-3 py-1.5 font-mono text-zinc-400 text-[11px] group-hover:text-zinc-300">
                                        {p.sku || '—'}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-right tabular-nums text-[11px] group-hover:text-zinc-300">
                                        {p.cost_per_bag != null ? formatCurrency(p.cost_per_bag) : '—'}
                                    </TableCell>
                                    <TableCell className="text-emerald-400 px-3 py-1.5 text-right tabular-nums text-[11px] group-hover:text-emerald-300">
                                        {formatPrice(p.price_cents)}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] group-hover:text-zinc-300">
                                        {formatDate(p.launch_date ?? p.launchDate)}
                                    </TableCell>
                                    <TableCell className="px-3 py-1.5">
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium',
                                                p.status === 'active'
                                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                                    : 'border-zinc-600/50 bg-zinc-800/50 text-zinc-500',
                                            )}
                                        >
                                            {p.status === 'active' ? (
                                                <>
                                                    <Eye className="size-3" />
                                                    Active
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff className="size-3" />
                                                    Hidden
                                                </>
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-3 py-1.5 text-right">
                                        <div className="flex justify-end">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-zinc-400 hover:bg-zinc-600/50 hover:text-zinc-100"
                                                        aria-label="Open actions"
                                                    >
                                                        <MoreHorizontal className="size-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="border-zinc-800 bg-zinc-900"
                                                >
                                                    <DropdownMenuItem
                                                        onClick={() => openEdit(p)}
                                                        className="cursor-pointer text-zinc-200"
                                                    >
                                                        <Pencil className="mr-2 size-3.5" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => requestDeleteProduct(p)}
                                                        className="cursor-pointer text-red-400 focus:text-red-400"
                                                    >
                                                        <Trash2 className="mr-2 size-3.5" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {filtered.length > 0 && (
                    <div className="flex w-full items-center justify-between gap-4 border-t border-zinc-700/80 px-4 py-3">
                        <p className="text-zinc-500 text-xs">
                            Showing {(safeCatalogPage - 1) * CATALOG_PAGE_SIZE + 1}–
                            {Math.min(safeCatalogPage * CATALOG_PAGE_SIZE, filtered.length)} of {filtered.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80 text-xs"
                                onClick={() => setCatalogPage((p) => Math.max(1, p - 1))}
                                disabled={safeCatalogPage <= 1}
                            >
                                <ChevronLeft className="size-3.5" />
                                Prev
                            </Button>
                            <span className="px-2 text-xs text-zinc-500">
                                Page {safeCatalogPage} of {catalogTotalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80 text-xs"
                                onClick={() => setCatalogPage((p) => Math.min(catalogTotalPages, p + 1))}
                                disabled={safeCatalogPage >= catalogTotalPages}
                            >
                                Next
                                <ChevronRight className="size-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <Dialog
                open={addModalOpen}
                onOpenChange={(open) => {
                    setAddModalOpen(open);
                    if (open) {
                        clearPendingCloseReset();
                    } else {
                        scheduleResetAfterClose();
                    }
                }}
            >
                <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit Product' : 'Add Product to Live Website'}</DialogTitle>
                        <DialogDescription>
                            {editingId
                                ? 'Update product details. Active products appear on your store.'
                                : 'Add a new product with images, description, and pricing. Active products appear on your store.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitProduct} className="space-y-5 py-2">
                        {/* Image */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-300">Product Image</Label>
                            <div className="flex gap-3">
                                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-zinc-600 bg-zinc-950/50">
                                    {form.imageUrl ? (
                                        <img
                                            src={form.imageUrl}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                            onError={(e) => (e.target.style.display = 'none')}
                                        />
                                    ) : (
                                        <ImageIcon className="size-8 text-zinc-600" />
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col gap-2">
                                    <Input
                                        placeholder="Image URL (e.g. https://...)"
                                        value={form.imageUrl ?? ''}
                                        onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                                        className="h-9 border-zinc-700 bg-zinc-950/80 text-xs text-white placeholder:text-zinc-500"
                                    />
                                    <p className="text-[10px] text-zinc-400">Or drag & drop (coming soon)</p>
                                </div>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="prod-name" className="text-xs text-zinc-300">
                                Product Name
                            </Label>
                            <Input
                                id="prod-name"
                                placeholder="e.g. Premium Brisket 12oz"
                                value={form.name ?? ''}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                className="h-9 border-zinc-700 bg-zinc-950/80 text-white placeholder:text-zinc-500"
                                required
                            />
                        </div>

                        {/* SKU (add only) & Flavor */}
                        <div className={`grid gap-4 ${editingId ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {!editingId ? (
                                <div className="space-y-1.5">
                                    <Label htmlFor="prod-sku" className="text-xs text-zinc-400">
                                        SKU
                                    </Label>
                                    <Input
                                        id="prod-sku"
                                        placeholder="e.g. CS-XX-00"
                                        value={form.sku ?? ''}
                                        onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                                        className="h-9 border-zinc-700 bg-zinc-950/80 text-white placeholder:text-zinc-500 font-mono"
                                    />
                                </div>
                            ) : null}
                            <div className="space-y-1.5">
                                <Label htmlFor="prod-flavor" className="text-xs text-zinc-400">
                                    Flavor
                                </Label>
                                <Input
                                    id="prod-flavor"
                                    placeholder="e.g. Brisket, Classic"
                                    value={form.flavor ?? ''}
                                    onChange={(e) => setForm((f) => ({ ...f, flavor: e.target.value }))}
                                    className="h-9 border-zinc-700 bg-zinc-950/80 text-white placeholder:text-zinc-500"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label htmlFor="prod-desc" className="text-xs text-zinc-300">
                                Description
                            </Label>
                            <textarea
                                id="prod-desc"
                                placeholder="Describe the product for customers..."
                                value={form.description ?? ''}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                rows={3}
                                className="w-full rounded-md border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        {/* Price, Cost & Size */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="prod-cost" className="text-xs text-zinc-300">
                                    Cost/Bag ($)
                                </Label>
                                <Input
                                    id="prod-cost"
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    placeholder="5.50"
                                    value={form.costPerBag ?? ''}
                                    onChange={(e) => setForm((f) => ({ ...f, costPerBag: e.target.value }))}
                                    className="h-9 border-zinc-700 bg-zinc-950/80 text-white placeholder:text-zinc-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="prod-price" className="text-xs text-zinc-300">
                                    Sell Price ($)
                                </Label>
                                <Input
                                    id="prod-price"
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    placeholder="14.99"
                                    value={form.price ?? ''}
                                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                                    className="h-9 border-zinc-700 bg-zinc-950/80 text-white placeholder:text-zinc-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="prod-size" className="text-xs text-zinc-300">
                                    Size/oz
                                </Label>
                                <Input
                                    id="prod-size"
                                    placeholder="e.g. 6oz"
                                    value={form.size ?? ''}
                                    onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
                                    className="h-9 border-zinc-700 bg-zinc-950/80 text-white placeholder:text-zinc-500"
                                />
                            </div>
                        </div>

                        {/* Launch Date */}
                        <div className="space-y-1.5">
                            <Label htmlFor="prod-launch" className="text-xs text-zinc-300">
                                Launch Date
                            </Label>
                            <Input
                                id="prod-launch"
                                type="date"
                                value={form.launchDate ?? ''}
                                onChange={(e) => setForm((f) => ({ ...f, launchDate: e.target.value }))}
                                className="h-9 border-zinc-700 bg-zinc-950/80 text-white placeholder:text-zinc-500"
                            />
                        </div>

                        {/* Category & Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-zinc-300">Category</Label>
                                <Select
                                    value={form.category ?? 'carne_seca'}
                                    onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                                >
                                    <SelectTrigger className="h-9 border-zinc-700 bg-zinc-950/80 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRODUCT_CATEGORIES.map((c) => (
                                            <SelectItem key={c.value} value={c.value} className="text-xs">
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-zinc-300">Status</Label>
                                <Select
                                    value={form.status ?? 'active'}
                                    onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                                >
                                    <SelectTrigger className="h-9 border-zinc-700 bg-zinc-950/80 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active" className="text-xs">
                                            Active (visible on site)
                                        </SelectItem>
                                        <SelectItem value="inactive" className="text-xs">
                                            Hidden (draft)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAddModalOpen(false)}
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30">
                                {editingId ? 'Save Changes' : 'Add Product'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    setDeleteModalOpen(open);
                    if (!open && !isDeleting) setDeleteTarget(null);
                }}
            >
                <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{deleteTarget?.name ?? 'this product'}&quot;? This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={isDeleting}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleDeleteProduct}
                            disabled={isDeleting}
                            className="bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
