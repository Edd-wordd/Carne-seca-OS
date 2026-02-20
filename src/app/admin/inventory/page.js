"use client";

import * as React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Box, Plus, Package, Search, AlertTriangle, CheckCircle, Download, Store, RotateCcw, Trash2, Layers, DollarSign, Pencil, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock loss records: { productId, type, quantity, value, date }
const MOCK_LOSSES = [
    { id: "L1", productId: "1", type: "spoilage", quantity: 3, value: 45, date: "2025-02-15" },
    { id: "L2", productId: "2", type: "spoilage", quantity: 2, value: 22, date: "2025-02-14" },
    { id: "L3", productId: "4", type: "return", quantity: 1, value: 20, date: "2025-02-16" },
    { id: "L4", productId: "1", type: "damage", quantity: 2, value: 30, date: "2025-02-10" },
    { id: "L5", productId: "5", type: "spoilage", quantity: 1, value: 13, date: "2025-02-12" },
    { id: "L6", productId: "2", type: "return", quantity: 1, value: 11, date: "2025-02-13" },
];

const MOCK_INVENTORY = [
    { id: "1", sku: "CS-PB-12", name: "Premium Brisket 12oz", stock: 84, reserved: 12, consignment: 24, lowThreshold: 20, value: 1260, costPerBag: 5.5, sellPrice: 14.99 },
    { id: "2", sku: "CS-SC-8", name: "Seasoned Classic 8oz", stock: 8, reserved: 2, consignment: 12, lowThreshold: 15, value: 88, costPerBag: 4.25, sellPrice: 10.99 },
    { id: "3", sku: "CS-O6", name: "Original 6oz", stock: 0, reserved: 0, consignment: 0, lowThreshold: 10, value: 0, costPerBag: 3.8, sellPrice: 8.99 },
    { id: "4", sku: "CS-LS", name: "Limited Smoked", stock: 45, reserved: 5, consignment: 18, lowThreshold: 20, value: 900, costPerBag: 6.2, sellPrice: 19.99 },
    { id: "5", sku: "CS-GH-6", name: "Garlic & Herb 6oz", stock: 32, reserved: 4, consignment: 8, lowThreshold: 15, value: 416, costPerBag: 4.0, sellPrice: 8.99 },
];

function formatCurrency(n) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n ?? 0);
}

const INVENTORY_PAGE_SIZE = 5;

function escapeCsv(val) {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
}

export default function InventoryPage() {
    const [search, setSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [adjustModalOpen, setAdjustModalOpen] = React.useState(false);
    const [addModalOpen, setAddModalOpen] = React.useState(false);
    const [inventory, setInventory] = React.useState(MOCK_INVENTORY);
    const [adjustProductId, setAdjustProductId] = React.useState("");
    const [adjustType, setAdjustType] = React.useState("add");
    const [adjustQuantity, setAdjustQuantity] = React.useState("");
    const [adjustNotes, setAdjustNotes] = React.useState("");
    const [newSku, setNewSku] = React.useState("");
    const [newName, setNewName] = React.useState("");
    const [newStock, setNewStock] = React.useState("");
    const [newLowThreshold, setNewLowThreshold] = React.useState("");
    const [newUnitValue, setNewUnitValue] = React.useState("");
    const [newCostPerBag, setNewCostPerBag] = React.useState("");
    const [newSellPrice, setNewSellPrice] = React.useState("");
    const [newConsignment, setNewConsignment] = React.useState("0");
    const [adjustReason, setAdjustReason] = React.useState("");
    const [losses, setLosses] = React.useState(MOCK_LOSSES);
    const [editModalOpen, setEditModalOpen] = React.useState(false);
    const [editingProduct, setEditingProduct] = React.useState(null);
    const [editForm, setEditForm] = React.useState({
        sku: "",
        name: "",
        stock: "",
        consignment: "",
        lowThreshold: "",
        costPerBag: "",
        sellPrice: "",
    });
    const [inventoryPage, setInventoryPage] = React.useState(1);

    const handleAdjustStock = () => {
        const qty = parseInt(adjustQuantity, 10) || 0;
        if (!adjustProductId || qty <= 0) return;
        const product = inventory.find((p) => p.id === adjustProductId);
        const unitValue =
            product && product.stock > 0
                ? product.value / product.stock
                : (product?.costPerBag ?? 0);

        setInventory((prev) =>
            prev.map((p) => {
                if (p.id !== adjustProductId) return p;
                const delta = adjustType === "add" ? qty : -qty;
                const newStock = Math.max(0, p.stock + delta);
                const newValue = Math.round(unitValue * newStock);
                return { ...p, stock: newStock, value: newValue };
            })
        );

        if (adjustType === "remove" && adjustReason && product) {
            const lossValue = Math.round(Math.min(qty, product.stock) * unitValue);
            setLosses((prev) => [
                ...prev,
                {
                    id: `L${Date.now()}`,
                    productId: adjustProductId,
                    type: adjustReason,
                    quantity: Math.min(qty, product.stock),
                    value: lossValue,
                    date: new Date().toISOString().slice(0, 10),
                },
            ]);
        }

        setAdjustModalOpen(false);
        setAdjustProductId("");
        setAdjustQuantity("");
        setAdjustNotes("");
        setAdjustReason("");
    };

    const handleExportCsv = () => {
        const headers = ["SKU", "Product", "Available", "Consignment", "Cost/Bag", "Sell Price", "Low Threshold", "Status", "Value"];
        const rows = filtered.map((p) => {
            const isOut = p.stock === 0;
            const isLow = !isOut && p.stock <= p.lowThreshold;
            const status = isOut ? "Out of stock" : isLow ? "Low stock" : "OK";
            return [
                p.sku,
                p.name,
                p.stock,
                p.consignment ?? 0,
                p.costPerBag != null ? `$${p.costPerBag.toFixed(2)}` : "",
                p.sellPrice != null ? `$${p.sellPrice.toFixed(2)}` : "",
                p.lowThreshold,
                status,
                `$${p.value.toLocaleString()}`,
            ]
                .map(escapeCsv)
                .join(",");
        });
        const csv = [headers.map(escapeCsv).join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setEditForm({
            sku: product.sku ?? "",
            name: product.name ?? "",
            stock: String(product.stock ?? ""),
            consignment: String(product.consignment ?? 0),
            lowThreshold: String(product.lowThreshold ?? ""),
            costPerBag: product.costPerBag != null ? String(product.costPerBag) : "",
            sellPrice: product.sellPrice != null ? String(product.sellPrice) : "",
        });
        setEditModalOpen(true);
    };

    const handleUpdateInventory = (e) => {
        e.preventDefault();
        if (!editingProduct) return;
        const stock = parseInt(editForm.stock, 10) || 0;
        const lowThresholdVal = parseInt(editForm.lowThreshold, 10);
        const lowThreshold = Number.isNaN(lowThresholdVal) ? (editingProduct.lowThreshold ?? 10) : lowThresholdVal;
        const costPerBag = parseFloat(String(editForm.costPerBag).replace(/[^0-9.]/g, "")) || 0;
        const sellPrice = parseFloat(String(editForm.sellPrice).replace(/[^0-9.]/g, "")) || 0;
        const consignment = parseInt(editForm.consignment, 10) || 0;
        const unitCost = costPerBag || (editingProduct.stock > 0 ? editingProduct.value / editingProduct.stock : 0);
        const value = Math.round(stock * unitCost);

        setInventory((prev) =>
            prev.map((p) =>
                p.id === editingProduct.id
                    ? {
                          ...p,
                          sku: editForm.sku.trim() || p.sku,
                          name: editForm.name.trim() || p.name,
                          stock,
                          consignment,
                          lowThreshold,
                          costPerBag: costPerBag || undefined,
                          sellPrice: sellPrice || undefined,
                          value,
                      }
                    : p,
            ),
        );
        setEditModalOpen(false);
        setEditingProduct(null);
    };

    const handleAddInventory = () => {
        const stock = parseInt(newStock, 10) || 0;
        const lowThreshold = parseInt(newLowThreshold, 10) || 10;
        const costPerBag = parseFloat(String(newCostPerBag).replace(/[^0-9.]/g, "")) || 0;
        const sellPrice = parseFloat(String(newSellPrice).replace(/[^0-9.]/g, "")) || 0;
        const unitPrice = parseFloat(String(newUnitValue).replace(/[^0-9.]/g, "")) || costPerBag || 0;
        const value = Math.round(stock * (unitPrice || costPerBag));
        const nextId = String(Math.max(...inventory.map((p) => parseInt(p.id, 10)), 0) + 1);
        if (!newSku.trim() || !newName.trim()) return;
        const consignment = parseInt(newConsignment, 10) || 0;
        setInventory((prev) => [
            ...prev,
            {
                id: nextId,
                sku: newSku.trim(),
                name: newName.trim(),
                stock,
                consignment,
                lowThreshold,
                value,
                costPerBag: costPerBag || undefined,
                sellPrice: sellPrice || undefined,
            },
        ]);
        setAddModalOpen(false);
        setNewSku("");
        setNewName("");
        setNewStock("");
        setNewLowThreshold("");
        setNewUnitValue("");
        setNewCostPerBag("");
        setNewSellPrice("");
        setNewConsignment("0");
    };

    const filtered = React.useMemo(() => {
        let items = inventory;
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            items = items.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.sku.toLowerCase().includes(q)
            );
        }
        if (statusFilter === "low") items = items.filter((p) => p.stock > 0 && p.stock <= p.lowThreshold);
        if (statusFilter === "out") items = items.filter((p) => p.stock === 0);
        return items;
    }, [search, statusFilter, inventory]);

    React.useEffect(() => setInventoryPage(1), [search, statusFilter]);

    const inventoryTotalPages = Math.max(1, Math.ceil(filtered.length / INVENTORY_PAGE_SIZE));
    const safeInventoryPage = Math.min(inventoryPage, inventoryTotalPages);
    const paginatedInventory = filtered.slice(
        (safeInventoryPage - 1) * INVENTORY_PAGE_SIZE,
        safeInventoryPage * INVENTORY_PAGE_SIZE,
    );

    const totalValue = inventory.reduce((s, p) => s + p.value, 0);
    const totalBags = inventory.reduce((s, p) => s + p.stock, 0);
    const totalCostToMake = inventory.reduce((s, p) => {
        const costPerBag = p.costPerBag ?? (p.stock > 0 ? p.value / p.stock : 0);
        return s + p.stock * costPerBag;
    }, 0);
    const totalConsignment = inventory.reduce((s, p) => s + (p.consignment ?? 0), 0);
    const consignmentValue = inventory.reduce((s, p) => {
        const unitValue = p.stock > 0 ? p.value / p.stock : 0;
        return s + Math.round((p.consignment ?? 0) * unitValue);
    }, 0);
    const lowStockCount = inventory.filter((p) => p.stock > 0 && p.stock <= p.lowThreshold).length;
    const outOfStockCount = inventory.filter((p) => p.stock === 0).length;

    const spoilageTotal = losses.filter((l) => l.type === "spoilage").reduce((s, l) => s + l.value, 0);
    const returnsTotal = losses.filter((l) => l.type === "return").reduce((s, l) => s + l.value, 0);
    const damageTotal = losses.filter((l) => l.type === "damage").reduce((s, l) => s + l.value, 0);
    const otherLossTotal = losses.filter((l) => !["spoilage", "return", "damage"].includes(l.type)).reduce((s, l) => s + l.value, 0);
    const totalLosses = spoilageTotal + returnsTotal + damageTotal + otherLossTotal;

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
                    <Button
                        size="sm"
                        className="gap-1.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs"
                        onClick={() => setAdjustModalOpen(true)}
                    >
                        Adjust Stock
                    </Button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <Layers className="size-4 shrink-0 text-indigo-400/80" />
                    <div className="min-w-0">
                        <p className="text-zinc-400 text-[10px]">Total Bags</p>
                        <p className="text-zinc-100 text-sm font-semibold tabular-nums">{totalBags.toLocaleString()}</p>
                        <p className="text-zinc-500 text-[9px]">available</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <DollarSign className="size-4 shrink-0 text-amber-400/80" />
                    <div className="min-w-0">
                        <p className="text-zinc-400 text-[10px]">Total Cost to Make</p>
                        <p className="text-amber-400 text-sm font-semibold tabular-nums">${totalCostToMake.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <Box className="size-4 shrink-0 text-indigo-400/80" />
                    <div className="min-w-0">
                        <p className="text-zinc-400 text-[10px]">Total Value</p>
                        <p className="text-zinc-100 text-sm font-semibold tabular-nums">${totalValue.toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <Store className="size-4 shrink-0 text-violet-400/80" />
                    <div className="min-w-0">
                        <p className="text-zinc-400 text-[10px]">On Consignment</p>
                        <p className="text-zinc-100 text-sm font-semibold tabular-nums">{totalConsignment} units</p>
                        <p className="text-zinc-500 text-[9px]">${consignmentValue.toLocaleString()} value</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <AlertTriangle className="size-4 shrink-0 text-amber-400/80" />
                    <div className="min-w-0">
                        <p className="text-zinc-400 text-[10px]">Low Stock</p>
                        <p className="text-zinc-100 text-sm font-semibold tabular-nums">{lowStockCount}</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <Package className="size-4 shrink-0 text-zinc-500" />
                    <div className="min-w-0">
                        <p className="text-zinc-400 text-[10px]">Out of Stock</p>
                        <p className="text-zinc-100 text-sm font-semibold tabular-nums">{outOfStockCount}</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <Trash2 className="size-4 shrink-0 text-red-400/80" />
                    <div className="min-w-0">
                        <p className="text-zinc-400 text-[10px]">Spoilage</p>
                        <p className="text-red-400 text-sm font-semibold tabular-nums">${spoilageTotal.toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <RotateCcw className="size-4 shrink-0 text-orange-400/80" />
                    <div className="min-w-0">
                        <p className="text-zinc-400 text-[10px]">Returns & Damage</p>
                        <p className="text-orange-400 text-sm font-semibold tabular-nums">${(returnsTotal + damageTotal + otherLossTotal).toLocaleString()}</p>
                        <p className="text-zinc-500 text-[9px]">Total lost: ${totalLosses.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {[
                    { value: "all", label: "All" },
                    { value: "low", label: "Low stock" },
                    { value: "out", label: "Out of stock" },
                ].map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatusFilter(opt.value)}
                        className={cn(
                            "rounded border px-2.5 py-1.5 text-[10px] font-medium transition-colors shrink-0",
                            statusFilter === opt.value
                                ? "border-zinc-500 bg-zinc-700/80 text-zinc-100"
                                : "border-zinc-600/50 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500/50 hover:bg-zinc-700/50 hover:text-zinc-200",
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded border border-zinc-700/80">
                <div className="border-b border-zinc-700/80 bg-zinc-900/80 px-3 py-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-zinc-100 text-xs font-medium">Product Inventory</h2>
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
                <Table>
                    <TableHeader>
                        <TableRow className="border-zinc-700/80 hover:!bg-transparent">
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">SKU</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Product</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Available</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Consignment</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px] text-right">Cost/Bag</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px] text-right">Sell Price</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Status</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px] text-right">Value</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-2 text-[10px] w-12" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedInventory.length === 0 ? (
                            <TableRow className="border-zinc-700/80">
                                <TableCell colSpan={9} className="text-zinc-400 py-8 text-center text-[11px]">
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
                                        <TableCell className="font-mono text-zinc-400 px-3 py-1.5 text-[11px] group-hover:text-zinc-300">
                                            {p.sku}
                                        </TableCell>
                                        <TableCell className="text-zinc-200 px-3 py-1.5 text-[11px] font-medium group-hover:text-zinc-100">
                                            {p.name}
                                        </TableCell>
                                        <TableCell className="text-zinc-400 px-3 py-1.5 tabular-nums text-[11px] group-hover:text-zinc-300">
                                            {p.stock}
                                        </TableCell>
                                        <TableCell className="text-violet-400 px-3 py-1.5 tabular-nums text-[11px] group-hover:text-violet-300">
                                            {p.consignment ?? 0}
                                        </TableCell>
                                        <TableCell className="text-zinc-400 px-3 py-1.5 text-right tabular-nums text-[11px] group-hover:text-zinc-300">
                                            {p.costPerBag != null ? formatCurrency(p.costPerBag) : "—"}
                                        </TableCell>
                                        <TableCell className="text-emerald-400 px-3 py-1.5 text-right tabular-nums text-[11px] group-hover:text-emerald-300">
                                            {p.sellPrice != null ? formatCurrency(p.sellPrice) : "—"}
                                        </TableCell>
                                        <TableCell className="px-3 py-1.5">
                                            {isOut ? (
                                                <span className="inline-flex items-center gap-1 rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400">
                                                    Out of stock
                                                </span>
                                            ) : isLow ? (
                                                <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                                                    <AlertTriangle className="size-3" />
                                                    Low
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                                                    <CheckCircle className="size-3" />
                                                    OK
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-zinc-100 px-3 py-1.5 text-right tabular-nums text-[11px] font-medium group-hover:text-white">
                                            ${p.value.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="px-2 py-1.5">
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
                                                <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900">
                                                    <DropdownMenuItem
                                                        onClick={() => openEditModal(p)}
                                                        className="text-zinc-200 cursor-pointer"
                                                    >
                                                        <Pencil className="size-3.5 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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

            <Dialog open={adjustModalOpen} onOpenChange={setAdjustModalOpen}>
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Adjust Stock</DialogTitle>
                        <DialogDescription>
                            Add or remove stock for a product.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Product</label>
                            <Select value={adjustProductId} onValueChange={setAdjustProductId}>
                                <SelectTrigger className="border-zinc-700 bg-zinc-900/80 text-zinc-100">
                                    <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {inventory.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.sku} — {p.name} (stock: {p.stock})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Type</label>
                                <Select value={adjustType} onValueChange={setAdjustType}>
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
                        {adjustType === "remove" && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Reason (records loss)</label>
                                <Select value={adjustReason} onValueChange={setAdjustReason}>
                                    <SelectTrigger className="border-zinc-700 bg-zinc-900/80 text-zinc-100">
                                        <SelectValue placeholder="Select reason" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="spoilage">Spoilage</SelectItem>
                                        <SelectItem value="return">Return</SelectItem>
                                        <SelectItem value="damage">Damage</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
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
                            disabled={!adjustProductId || !adjustQuantity || parseInt(adjustQuantity, 10) <= 0}
                            className="bg-indigo-600 text-white hover:bg-indigo-500"
                        >
                            Apply
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Inventory</DialogTitle>
                        <DialogDescription>
                            Add a new product to inventory.
                        </DialogDescription>
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
                                <label className="text-sm font-medium text-zinc-300">Cost to make ($)</label>
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
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Unit value ($)</label>
                                <Input
                                    placeholder="Inventory value basis"
                                    value={newUnitValue}
                                    onChange={(e) => setNewUnitValue(e.target.value)}
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
                    if (!open) {
                        setEditModalOpen(false);
                        setEditingProduct(null);
                    }
                }}
            >
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Inventory</DialogTitle>
                        <DialogDescription>
                            Update {editingProduct?.name ?? "product"} details.
                        </DialogDescription>
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Stock</label>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={editForm.stock}
                                    onChange={(e) => setEditForm((f) => ({ ...f, stock: e.target.value }))}
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                                />
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
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Consignment</label>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={editForm.consignment}
                                    onChange={(e) => setEditForm((f) => ({ ...f, consignment: e.target.value }))}
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Cost to make ($)</label>
                                <Input
                                    placeholder="e.g. 5.50"
                                    value={editForm.costPerBag}
                                    onChange={(e) => setEditForm((f) => ({ ...f, costPerBag: e.target.value }))}
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Sell price ($)</label>
                                <Input
                                    placeholder="e.g. 14.99"
                                    value={editForm.sellPrice}
                                    onChange={(e) => setEditForm((f) => ({ ...f, sellPrice: e.target.value }))}
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                                />
                            </div>
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
