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
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Package, Plus, Search, MoreHorizontal, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SELL_PLATFORMS = [
    { value: "website", label: "Website" },
    { value: "amazon", label: "Amazon" },
    { value: "pos", label: "POS" },
];

const SIZE_OPTIONS = [
    { value: "4oz", label: "4oz" },
    { value: "6oz", label: "6oz" },
    { value: "8oz", label: "8oz" },
    { value: "12oz", label: "12oz" },
];

const INITIAL_PRODUCTS = [
    { id: "1", name: "Premium Brisket 12oz", price_cents: 1500, status: "active", stock: 84, description: "Premium dried brisket, 12oz. Slow-smoked for 18 hours.", image: null, platforms: ["website", "amazon"], launchDate: "2024-01-15", sizes: ["8oz", "12oz"] },
    { id: "2", name: "Seasoned Classic 8oz", price_cents: 1100, status: "active", stock: 8, description: "Classic seasoned blend, 8oz.", image: null, platforms: ["website"], launchDate: "2024-03-22", sizes: ["6oz", "8oz"] },
    { id: "3", name: "Original 6oz", price_cents: 899, status: "inactive", stock: 0, description: "Original recipe, 6oz.", image: null, platforms: ["website", "pos"], launchDate: "2023-11-01", sizes: ["6oz"] },
    { id: "4", name: "Limited Smoked", price_cents: 1500, status: "active", stock: 45, description: "Limited edition smoked.", image: null, platforms: ["website", "amazon", "pos"], launchDate: "2025-02-01", sizes: ["6oz", "8oz", "12oz"] },
    { id: "5", name: "Garlic & Herb 6oz", price_cents: 899, status: "active", stock: 32, description: "Garlic and herb seasoned.", image: null, platforms: ["website", "pos"], launchDate: "2024-08-10", sizes: ["4oz", "6oz"] },
];

function formatPrice(cents) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(cents / 100);
}

function formatDate(d) {
    if (!d) return "—";
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function CatalogPage() {
    const [items, setItems] = React.useState(INITIAL_PRODUCTS);
    const [search, setSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [addModalOpen, setAddModalOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState(null);
    const [form, setForm] = React.useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        status: "active",
        imageUrl: "",
        platforms: ["website"],
        launchDate: "",
        sizes: [],
    });

    const resetForm = () => {
        setForm({ name: "", description: "", price: "", stock: "", status: "active", imageUrl: "", platforms: ["website"], launchDate: "", sizes: [] });
        setEditingId(null);
    };

    const toggleSize = (value) => {
        setForm((f) => ({
            ...f,
            sizes: f.sizes.includes(value)
                ? f.sizes.filter((x) => x !== value)
                : [...f.sizes, value],
        }));
    };

    const togglePlatform = (value) => {
        setForm((f) => ({
            ...f,
            platforms: f.platforms.includes(value)
                ? f.platforms.filter((x) => x !== value)
                : [...f.platforms, value],
        }));
    };

    const openEdit = (p) => {
        setForm({
            name: p.name,
            description: p.description || "",
            price: p.price_cents ? (p.price_cents / 100).toFixed(2) : "",
            stock: String(p.stock ?? 0),
            status: p.status,
            imageUrl: p.image || "",
            platforms: Array.isArray(p.platforms) && p.platforms.length ? p.platforms : ["website"],
            launchDate: p.launchDate || "",
            sizes: Array.isArray(p.sizes) ? p.sizes : [],
        });
        setEditingId(p.id);
        setAddModalOpen(true);
    };

    const handleSubmitProduct = (e) => {
        e.preventDefault();
        const priceDollars = parseFloat(form.price) || 0;
        const priceCents = Math.round(priceDollars * 100);
        const stock = parseInt(form.stock, 10) || 0;
        const payload = {
            name: form.name.trim() || "Untitled",
            price_cents: priceCents,
            status: form.status,
            stock,
            description: form.description.trim() || null,
            image: form.imageUrl.trim() || null,
            platforms: form.platforms.length ? form.platforms : ["website"],
            launchDate: form.launchDate.trim() || null,
            sizes: form.sizes,
        };
        if (editingId) {
            setItems((prev) =>
                prev.map((p) => (p.id === editingId ? { ...p, ...payload } : p))
            );
        } else {
            const newId = String(Math.max(...items.map((p) => parseInt(p.id, 10) || 0), 0) + 1);
            setItems((prev) => [{ id: newId, ...payload }, ...prev]);
        }
        resetForm();
        setAddModalOpen(false);
    };

    const filtered = React.useMemo(() => {
        let list = items;
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter((p) => p.name.toLowerCase().includes(q));
        }
        if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
        return list;
    }, [items, search, statusFilter]);

    const activeCount = items.filter((p) => p.status === "active").length;

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
                    onClick={() => setAddModalOpen(true)}
                >
                    <Plus className="size-3.5" />
                    Add Product
                </Button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded border border-zinc-700/80">
                <div className="border-b border-zinc-700/80 bg-zinc-900/80 px-3 py-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-zinc-100 text-xs font-medium">Catalog Items</h2>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                                <Input
                                    placeholder="Search catalog…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-7 w-[160px] border-zinc-700 bg-zinc-950 pl-8 text-[10px] text-zinc-100 placeholder:text-zinc-500"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-7 w-[120px] border-zinc-700 bg-zinc-950 text-zinc-100 text-[10px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs">All</SelectItem>
                                    <SelectItem value="active" className="text-xs">Active</SelectItem>
                                    <SelectItem value="inactive" className="text-xs">Hidden</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="border-zinc-700/80 hover:!bg-transparent">
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px] w-14" />
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Item</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Price</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Stock</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Sizes</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Platforms</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Launch</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Status</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px] w-24" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow className="border-zinc-700/80">
                                <TableCell colSpan={9} className="text-zinc-400 py-8 text-center text-[11px]">
                                    No catalog items match the filters
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((p) => (
                                <TableRow
                                    key={p.id}
                                    className="group border-zinc-700/80 transition-colors hover:!bg-zinc-700/50"
                                >
                                    <TableCell className="px-3 py-1.5">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-zinc-700 bg-zinc-900/80">
                                            {p.image ? (
                                                <img
                                                    src={p.image}
                                                    alt={p.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <ImageIcon className="size-4 text-zinc-600" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-3 py-1.5">
                                        <div>
                                            <p className="text-zinc-200 text-[11px] font-medium group-hover:text-zinc-100">
                                                {p.name}
                                            </p>
                                            {p.description && (
                                                <p className="text-zinc-500 text-[10px] truncate max-w-[200px]">
                                                    {p.description}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 tabular-nums text-[11px] group-hover:text-zinc-300">
                                        {formatPrice(p.price_cents)}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 tabular-nums text-[11px] group-hover:text-zinc-300">
                                        {p.stock}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] group-hover:text-zinc-300">
                                        {((p.sizes?.length ? p.sizes : []).join(", ")) || "—"}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] group-hover:text-zinc-300">
                                        {((p.platforms?.length ? p.platforms : ["website"]).map((pf) => SELL_PLATFORMS.find((s) => s.value === pf)?.label ?? pf).join(", ")) || "—"}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] group-hover:text-zinc-300">
                                        {formatDate(p.launchDate)}
                                    </TableCell>
                                    <TableCell className="px-3 py-1.5">
                                        <span
                                            className={cn(
                                                "inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium",
                                                p.status === "active"
                                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                                    : "border-zinc-600/50 bg-zinc-800/50 text-zinc-500"
                                            )}
                                        >
                                            {p.status === "active" ? (
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
                                    <TableCell className="px-3 py-1.5">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-zinc-400 hover:bg-zinc-600/50 hover:text-zinc-100"
                                            onClick={() => openEdit(p)}
                                            aria-label="Edit"
                                        >
                                            <MoreHorizontal className="size-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog
                open={addModalOpen}
                onOpenChange={(open) => {
                    setAddModalOpen(open);
                    if (!open) resetForm();
                }}
            >
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Product" : "Add Product to Live Website"}</DialogTitle>
                        <DialogDescription>
                            Add a new product with images, description, and pricing. Active products appear on your store.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitProduct} className="space-y-5 py-2">
                        {/* Image */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-400">Product Image</Label>
                            <div className="flex gap-3">
                                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-zinc-600 bg-zinc-950/50">
                                    {form.imageUrl ? (
                                        <img
                                            src={form.imageUrl}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                            onError={(e) => (e.target.style.display = "none")}
                                        />
                                    ) : (
                                        <ImageIcon className="size-8 text-zinc-600" />
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col gap-2">
                                    <Input
                                        placeholder="Image URL (e.g. https://...)"
                                        value={form.imageUrl}
                                        onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                                        className="h-9 border-zinc-700 bg-zinc-950/80 text-xs"
                                    />
                                    <p className="text-[10px] text-zinc-500">Or drag & drop (coming soon)</p>
                                </div>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="prod-name" className="text-xs text-zinc-400">
                                Product Name
                            </Label>
                            <Input
                                id="prod-name"
                                placeholder="e.g. Premium Brisket 12oz"
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                className="h-9 border-zinc-700 bg-zinc-950/80"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label htmlFor="prod-desc" className="text-xs text-zinc-400">
                                Description
                            </Label>
                            <textarea
                                id="prod-desc"
                                placeholder="Describe the product for customers..."
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                rows={3}
                                className="w-full rounded-md border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        {/* Price & Stock */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="prod-price" className="text-xs text-zinc-400">
                                    Price ($)
                                </Label>
                                <Input
                                    id="prod-price"
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    placeholder="14.99"
                                    value={form.price}
                                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                                    className="h-9 border-zinc-700 bg-zinc-950/80"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="prod-stock" className="text-xs text-zinc-400">
                                    Stock
                                </Label>
                                <Input
                                    id="prod-stock"
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={form.stock}
                                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                                    className="h-9 border-zinc-700 bg-zinc-950/80"
                                />
                            </div>
                        </div>

                        {/* Launch Date */}
                        <div className="space-y-1.5">
                            <Label htmlFor="prod-launch" className="text-xs text-zinc-400">
                                Launch Date
                            </Label>
                            <Input
                                id="prod-launch"
                                type="date"
                                value={form.launchDate}
                                onChange={(e) => setForm((f) => ({ ...f, launchDate: e.target.value }))}
                                className="h-9 border-zinc-700 bg-zinc-950/80"
                            />
                        </div>

                        {/* Sizes */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-400">Sizes offered</Label>
                            <div className="flex flex-wrap gap-2">
                                {SIZE_OPTIONS.map((sz) => (
                                    <label
                                        key={sz.value}
                                        className="flex cursor-pointer items-center gap-2 rounded border border-zinc-700 px-3 py-2 text-xs transition-colors hover:bg-zinc-800/50"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.sizes.includes(sz.value)}
                                            onChange={() => toggleSize(sz.value)}
                                            className="rounded border-zinc-600 bg-zinc-900"
                                        />
                                        <span className="text-zinc-300">{sz.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Platforms */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-400">Sell on</Label>
                            <div className="flex flex-wrap gap-2">
                                {SELL_PLATFORMS.map((pf) => (
                                    <label
                                        key={pf.value}
                                        className="flex cursor-pointer items-center gap-2 rounded border border-zinc-700 px-3 py-2 text-xs transition-colors hover:bg-zinc-800/50"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.platforms.includes(pf.value)}
                                            onChange={() => togglePlatform(pf.value)}
                                            className="rounded border-zinc-600 bg-zinc-900"
                                        />
                                        <span className="text-zinc-300">{pf.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-400">Visibility</Label>
                            <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                                <SelectTrigger className="h-9 border-zinc-700 bg-zinc-950/80">
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
                                {editingId ? "Save Changes" : "Add Product"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
