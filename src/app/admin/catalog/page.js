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
import { Package, Plus, Search, Pencil, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const INITIAL_PRODUCTS = [
    { id: "1", name: "Premium Brisket 12oz", price_cents: 1500, status: "active", stock: 84, description: "Premium dried brisket, 12oz" },
    { id: "2", name: "Seasoned Classic 8oz", price_cents: 1100, status: "active", stock: 8, description: "Classic seasoned blend, 8oz" },
    { id: "3", name: "Original 6oz", price_cents: 899, status: "inactive", stock: 0, description: "Original recipe, 6oz" },
    { id: "4", name: "Limited Smoked", price_cents: 1500, status: "active", stock: 45, description: "Limited edition smoked" },
    { id: "5", name: "Garlic & Herb 6oz", price_cents: 899, status: "active", stock: 32, description: "Garlic and herb seasoned" },
];

function formatPrice(cents) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(cents / 100);
}

export default function CatalogPage() {
    const [items, setItems] = React.useState(INITIAL_PRODUCTS);
    const [search, setSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [addModalOpen, setAddModalOpen] = React.useState(false);
    const [form, setForm] = React.useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        status: "active",
    });

    const handleAddToCatalog = (e) => {
        e.preventDefault();
        const priceDollars = parseFloat(form.price) || 0;
        const priceCents = Math.round(priceDollars * 100);
        const stock = parseInt(form.stock, 10) || 0;
        const newId = String(Math.max(...items.map((p) => parseInt(p.id, 10) || 0), 0) + 1);
        setItems((prev) => [
            {
                id: newId,
                name: form.name.trim() || "Untitled",
                price_cents: priceCents,
                status: form.status,
                stock,
                description: form.description.trim() || null,
            },
            ...prev,
        ]);
        setForm({ name: "", description: "", price: "", stock: "", status: "active" });
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
                    <p className="text-zinc-400 mt-0.5 text-xs">Manage your product catalog</p>
                </div>
                <Button
                    size="sm"
                    className="gap-1.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 w-fit"
                    onClick={() => setAddModalOpen(true)}
                >
                    <Plus className="size-3.5" />
                    Add to Catalog
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
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Item</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Price</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Stock</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Status</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px] w-24" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow className="border-zinc-700/80">
                                <TableCell colSpan={5} className="text-zinc-400 py-8 text-center text-[11px]">
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
                                            size="sm"
                                            className="h-6 px-2 text-[10px] text-zinc-400 hover:bg-zinc-600/50 hover:text-zinc-100"
                                        >
                                            <Pencil className="size-3 mr-1" />
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add to Catalog</DialogTitle>
                        <DialogDescription>Add a new item to your product catalog.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddToCatalog} className="grid gap-4 py-2">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-zinc-300">Name</Label>
                            <Input
                                placeholder="e.g. Premium Brisket 12oz"
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-zinc-300">Description</Label>
                            <Input
                                placeholder="Optional description"
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-zinc-300">Price ($)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    placeholder="e.g. 14.99"
                                    value={form.price}
                                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-zinc-300">Stock</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={form.stock}
                                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-zinc-300">Status</Label>
                            <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                                <SelectTrigger className="border-zinc-700 bg-zinc-900/80 text-zinc-100">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Hidden</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAddModalOpen(false)}
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-500">
                                Add to Catalog
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
