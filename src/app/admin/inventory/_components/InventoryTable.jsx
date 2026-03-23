'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { adjustStock } from '@/app/actions/inventory/adjustStock';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Plus,
    Search,
    AlertTriangle,
    CheckCircle,
    Download,
    RotateCcw,
    Pencil,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { InventoryKPIs } from './InventoryKPIs';
import { cn } from '@/lib/utils/helpers';
import { exportInventoryToCsv } from '@/lib/utils/exportInventory';
import { addInventory } from '@/app/actions/inventory/addInventory';

const INVENTORY_PAGE_SIZE = 15;

export function InventoryTable({ initialInventory = [], adjustmentsLog = [] }) {
    const router = useRouter();
    const mountedRef = React.useRef(true);
    React.useEffect(
        () => () => {
            mountedRef.current = false;
        },
        [],
    );
    const [inventory, setInventory] = React.useState(initialInventory);
    const [search, setSearch] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('all');
    const [adjustModalOpen, setAdjustModalOpen] = React.useState(false);
    const [addModalOpen, setAddModalOpen] = React.useState(false);
    const [adjustProductId, setAdjustProductId] = React.useState('');
    const [adjustType, setAdjustType] = React.useState('add');
    const [adjustQuantity, setAdjustQuantity] = React.useState('');
    const [adjustNotes, setAdjustNotes] = React.useState('');
    const [newSku, setNewSku] = React.useState('');
    const [newName, setNewName] = React.useState('');
    const [newStock, setNewStock] = React.useState('');
    const [newLowThreshold, setNewLowThreshold] = React.useState('');
    const [newCostPerBag, setNewCostPerBag] = React.useState('');
    const [newSellPrice, setNewSellPrice] = React.useState('');
    const [newConsignment, setNewConsignment] = React.useState('0');
    const [adjustReason, setAdjustReason] = React.useState('');
    const [editModalOpen, setEditModalOpen] = React.useState(false);
    const [editingProduct, setEditingProduct] = React.useState(null);
    const [editForm, setEditForm] = React.useState({
        sku: '',
        name: '',
        lowThreshold: '',
    });
    const [inventoryPage, setInventoryPage] = React.useState(1);
    React.useEffect(() => {
        setInventory(initialInventory);
    }, [initialInventory]);

    const handleAdjustStock = async () => {
        const qty = parseInt(adjustQuantity, 10) || 0;
        if (!adjustProductId || qty <= 0) return;
        if (adjustType === 'remove' && !adjustReason) return;

        const result = await adjustStock({
            productId: adjustProductId,
            adjustType,
            quantity: qty,
            reason: adjustReason,
            notes: adjustNotes,
        });

        if (!mountedRef.current) return;
        if (result.success) {
            setAdjustModalOpen(false);
            setAdjustProductId('');
            setAdjustQuantity('');
            setAdjustNotes('');
            setAdjustReason('');
            router.refresh();
        } else {
            alert(result.error);
        }
    };

    const handleExportCsv = () => exportInventoryToCsv(filtered);

    const openEditModal = (product) => {
        setEditingProduct(product);
        setEditForm({
            sku: product.sku ?? '',
            name: product.name ?? '',
            lowThreshold: String(product.lowThreshold ?? ''),
        });
        setEditModalOpen(true);
    };

    const handleUpdateInventory = (e) => {
        e.preventDefault();
        if (!editingProduct) return;
        const lowThresholdVal = parseInt(editForm.lowThreshold, 10);
        const lowThreshold = Number.isNaN(lowThresholdVal) ? (editingProduct.lowThreshold ?? 10) : lowThresholdVal;

        setInventory((prev) =>
            prev.map((p) =>
                p.id === editingProduct.id
                    ? {
                          ...p,
                          sku: editForm.sku.trim() || p.sku,
                          name: editForm.name.trim() || p.name,
                          lowThreshold,
                      }
                    : p,
            ),
        );
        setEditModalOpen(false);
        setEditingProduct(null);
    };

    const handleAddInventory = async () => {
        const stock = parseInt(newStock, 10) || 0;
        const lowThreshold = parseInt(newLowThreshold, 10) || 10;
        const costPerBag = parseFloat(String(newCostPerBag).replace(/[^0-9.]/g, '')) || 0;
        const sellPrice = parseFloat(String(newSellPrice).replace(/[^0-9.]/g, '')) || 0;
        if (!newSku.trim() || !newName.trim()) return;
        const consignment = parseInt(newConsignment, 10) || 0;

        const result = await addInventory({
            sku: newSku.trim(),
            name: newName.trim(),
            stock,
            lowThreshold,
            consignment,
            costToAcquire: costPerBag,
            sellPrice,
        });

        if (!mountedRef.current) return;
        if (result.success) {
            setAddModalOpen(false);
            setNewSku('');
            setNewName('');
            setNewStock('');
            setNewLowThreshold('');
            setNewCostPerBag('');
            setNewSellPrice('');
            setNewConsignment('0');
            router.refresh();
        } else {
            alert(result.error ?? 'Failed to add inventory.');
        }
    };

    const filtered = React.useMemo(() => {
        let items = inventory;
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            items = items.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
        }
        if (statusFilter === 'low') items = items.filter((p) => p.stock > 0 && p.stock <= p.lowThreshold);
        if (statusFilter === 'out') items = items.filter((p) => p.stock === 0);
        return items;
    }, [search, statusFilter, inventory]);

    React.useEffect(() => setInventoryPage(1), [search, statusFilter]);

    const inventoryTotalPages = Math.max(1, Math.ceil(filtered.length / INVENTORY_PAGE_SIZE));
    const safeInventoryPage = Math.min(inventoryPage, inventoryTotalPages);
    const paginatedInventory = filtered.slice(
        (safeInventoryPage - 1) * INVENTORY_PAGE_SIZE,
        safeInventoryPage * INVENTORY_PAGE_SIZE,
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-zinc-100 text-lg font-semibold tracking-tight">Inventory</h1>
                    <p className="text-zinc-400 mt-0.5 text-xs">Product stock levels & alerts</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 text-xs"
                        onClick={handleExportCsv}
                    >
                        <Download className="size-3.5" />
                        Export CSV
                    </Button>
                    <Button
                        size="sm"
                        className="gap-1.5 bg-indigo-600 text-white hover:bg-indigo-500 text-xs"
                        onClick={() => setAddModalOpen(true)}
                    >
                        <Plus className="size-3.5" />
                        Add Inventory
                    </Button>
                </div>
            </div>

            <InventoryKPIs inventory={inventory} adjustmentsLog={adjustmentsLog} />

            <div className="flex flex-1 flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
                    {[
                        { value: 'all', label: 'All' },
                        { value: 'low', label: 'Low stock' },
                        { value: 'out', label: 'Out of stock' },
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

            {/* Table */}
            <div className="overflow-hidden rounded border border-zinc-800">
                <div className="border-b border-zinc-800 bg-zinc-900/80 px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-zinc-200 text-sm font-medium">Product Inventory</h2>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                            <Input
                                placeholder="Search products…"
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
                            <TableHead className="text-zinc-500 h-8 w-[16%] px-2 text-xs">SKU</TableHead>
                            <TableHead className="text-zinc-500 h-8 w-[16%] px-2 text-xs">Product</TableHead>
                            <TableHead className="text-zinc-500 h-8 w-[16%] px-2 text-xs">Available</TableHead>
                            <TableHead className="text-zinc-500 h-8 w-[16%] px-2 text-xs">Consignment</TableHead>
                            <TableHead className="text-zinc-500 h-8 w-[16%] px-2 text-xs">Status</TableHead>
                            <TableHead className="text-zinc-500 h-8 w-[16%] px-2 text-xs">Value</TableHead>
                            <TableHead className="text-zinc-500 h-8 w-16 pl-4 pr-2 text-right text-xs">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedInventory.length === 0 ? (
                            <TableRow className="border-zinc-700/80">
                                <TableCell colSpan={7} className="text-zinc-400 py-8 text-center text-xs">
                                    No products match the filters
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedInventory.map((p) => {
                                const isOut = p.stock === 0;
                                const isLow = !isOut && p.stock <= p.lowThreshold;
                                return (
                                    <TableRow
                                        key={p.id}
                                        className="group border-zinc-700/80 transition-colors hover:!bg-zinc-700/50"
                                    >
                                        <TableCell className="font-mono text-zinc-400 px-2 py-2.5 text-xs group-hover:text-zinc-300">
                                            {p.sku}
                                        </TableCell>
                                        <TableCell className="text-zinc-200 px-2 py-2.5 text-xs font-medium group-hover:text-zinc-100">
                                            {p.name}
                                        </TableCell>
                                        <TableCell className="text-zinc-400 px-2 py-2.5 tabular-nums text-xs group-hover:text-zinc-300">
                                            {p.stock}
                                        </TableCell>
                                        <TableCell className="text-violet-400 px-2 py-2.5 tabular-nums text-xs group-hover:text-violet-300">
                                            {p.consignment ?? 0}
                                        </TableCell>
                                        <TableCell className="px-2 py-2.5 text-xs">
                                            {isOut ? (
                                                <span className="inline-flex items-center gap-1 rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-400">
                                                    Out of stock
                                                </span>
                                            ) : isLow ? (
                                                <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                                                    <AlertTriangle className="size-3" />
                                                    Low
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                                                    <CheckCircle className="size-3" />
                                                    OK
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-zinc-100 px-2 py-2.5 tabular-nums text-xs font-medium group-hover:text-white">
                                            $
                                            {p.value.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </TableCell>
                                        <TableCell className="pl-4 pr-2 py-2.5 text-right">
                                            <div className="flex justify-end">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-600/50"
                                                        >
                                                            <MoreHorizontal className="size-3.5" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="border-zinc-800 bg-zinc-900"
                                                    >
                                                        <DropdownMenuItem
                                                            onClick={() => openEditModal(p)}
                                                            className="text-zinc-200 cursor-pointer"
                                                        >
                                                            <Pencil className="size-3.5 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setAdjustProductId(p.id);
                                                                setAdjustModalOpen(true);
                                                            }}
                                                            className="text-zinc-200 cursor-pointer"
                                                        >
                                                            <RotateCcw className="size-3.5 mr-2" />
                                                            Adjust Stock
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
                {filtered.length > 0 && (
                    <div className="flex w-full items-center justify-between gap-4 border-t border-zinc-800/80 px-4 py-3">
                        <p className="text-zinc-500 text-xs">
                            Showing {(safeInventoryPage - 1) * INVENTORY_PAGE_SIZE + 1}–
                            {Math.min(safeInventoryPage * INVENTORY_PAGE_SIZE, filtered.length)} of {filtered.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80 text-xs"
                                onClick={() => setInventoryPage((p) => Math.max(1, p - 1))}
                                disabled={safeInventoryPage <= 1}
                            >
                                <ChevronLeft className="size-3.5" />
                                Prev
                            </Button>
                            <span className="px-2 text-xs text-zinc-500">
                                Page {safeInventoryPage} of {inventoryTotalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80 text-xs"
                                onClick={() => setInventoryPage((p) => Math.min(inventoryTotalPages, p + 1))}
                                disabled={safeInventoryPage >= inventoryTotalPages}
                            >
                                Next
                                <ChevronRight className="size-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <Dialog
                open={adjustModalOpen}
                onOpenChange={(open) => {
                    queueMicrotask(() => {
                        setAdjustModalOpen(open);
                        if (!open) {
                            setAdjustProductId('');
                            setAdjustType('add');
                            setAdjustQuantity('');
                            setAdjustNotes('');
                            setAdjustReason('');
                        }
                    });
                }}
            >
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Adjust Stock</DialogTitle>
                        <DialogDescription>
                            {adjustProductId
                                ? `Add or remove stock for ${inventory.find((p) => p.id === adjustProductId)?.name ?? 'this product'}.`
                                : 'Add or remove stock for a product.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        {adjustProductId && (
                            <div className="rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2">
                                <p className="text-[10px] text-zinc-500">Product</p>
                                <p className="text-sm font-medium text-zinc-200">
                                    {inventory.find((p) => p.id === adjustProductId)?.sku} —{' '}
                                    {inventory.find((p) => p.id === adjustProductId)?.name} (stock:{' '}
                                    {inventory.find((p) => p.id === adjustProductId)?.stock})
                                </p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Type</label>
                                <Select
                                    value={adjustType}
                                    onValueChange={(v) => {
                                        setAdjustType(v);
                                        if (v === 'add') setAdjustReason('');
                                    }}
                                >
                                    <SelectTrigger className="border-zinc-700 bg-zinc-900/80 text-zinc-100">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="add">Add</SelectItem>
                                        <SelectItem value="remove">Remove</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Quantity</label>
                                <Input
                                    type="number"
                                    min={1}
                                    placeholder="0"
                                    value={adjustQuantity}
                                    onChange={(e) => setAdjustQuantity(e.target.value)}
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">
                                Reason {adjustType === 'remove' ? '(records loss)' : '(for removals)'}
                            </label>
                            <Select
                                value={adjustReason}
                                onValueChange={setAdjustReason}
                                disabled={adjustType === 'add'}
                            >
                                <SelectTrigger className="border-zinc-700 bg-zinc-900/80 text-zinc-100">
                                    <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="spoiled">Spoiled</SelectItem>
                                    <SelectItem value="donated">Donated</SelectItem>
                                    <SelectItem value="given_away">Given Away</SelectItem>
                                    <SelectItem value="lost">Lost</SelectItem>
                                    <SelectItem value="correction">Correction</SelectItem>
                                    <SelectItem value="guest_satisfaction">Guest Satisfaction</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Notes (optional)</label>
                            <Input
                                placeholder="e.g. Restock from supplier"
                                value={adjustNotes}
                                onChange={(e) => setAdjustNotes(e.target.value)}
                                className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setAdjustModalOpen(false)}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAdjustStock}
                            disabled={
                                !adjustQuantity ||
                                parseInt(adjustQuantity, 10) <= 0 ||
                                (adjustType === 'remove' && !adjustReason)
                            }
                            className="bg-indigo-600 text-white hover:bg-indigo-500"
                        >
                            Apply
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={addModalOpen} onOpenChange={(open) => queueMicrotask(() => setAddModalOpen(open))}>
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Inventory</DialogTitle>
                        <DialogDescription>Add a new product to inventory.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">SKU</label>
                                <Input
                                    placeholder="e.g. CS-XX-00"
                                    value={newSku}
                                    onChange={(e) => setNewSku(e.target.value)}
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500 font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Product name</label>
                                <Input
                                    placeholder="Product name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Stock</label>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={newStock}
                                    onChange={(e) => setNewStock(e.target.value)}
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Low threshold</label>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="10"
                                    value={newLowThreshold}
                                    onChange={(e) => setNewLowThreshold(e.target.value)}
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Consignment</label>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={newConsignment}
                                    onChange={(e) => setNewConsignment(e.target.value)}
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Cost to aquire ($)</label>
                                <Input
                                    placeholder="e.g. 5.50"
                                    value={newCostPerBag}
                                    onChange={(e) => setNewCostPerBag(e.target.value)}
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Sell price ($)</label>
                                <Input
                                    placeholder="e.g. 14.99"
                                    value={newSellPrice}
                                    onChange={(e) => setNewSellPrice(e.target.value)}
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setAddModalOpen(false)}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddInventory}
                            disabled={!newSku.trim() || !newName.trim()}
                            className="bg-indigo-600 text-white hover:bg-indigo-500"
                        >
                            Add
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={editModalOpen}
                onOpenChange={(open) => {
                    if (!open)
                        queueMicrotask(() => {
                            setEditModalOpen(false);
                            setEditingProduct(null);
                        });
                }}
            >
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Inventory</DialogTitle>
                        <DialogDescription>Update {editingProduct?.name ?? 'product'} details.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateInventory} className="grid gap-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">SKU</label>
                                <Input
                                    placeholder="e.g. CS-XX-00"
                                    value={editForm.sku}
                                    onChange={(e) => setEditForm((f) => ({ ...f, sku: e.target.value }))}
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500 font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Product name</label>
                                <Input
                                    placeholder="Product name"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Low threshold</label>
                            <Input
                                type="number"
                                min={0}
                                placeholder="10"
                                value={editForm.lowThreshold}
                                onChange={(e) => setEditForm((f) => ({ ...f, lowThreshold: e.target.value }))}
                                className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditModalOpen(false)}
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!editForm.sku.trim() || !editForm.name.trim()}
                                className="bg-indigo-600 text-white hover:bg-indigo-500"
                            >
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
