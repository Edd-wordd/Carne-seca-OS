'use client';

import * as React from 'react';
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

function getDefaultAddSupplyForm() {
    return {
        name: '',
        category: 'meat',
        quantity: '',
        weight: '',
        unit: 'lb',
        unitCost: '',
        purchasedFrom: '',
        paymentMethod: 'credit_card',
        purchasedBy: '',
        purchaseDate: new Date().toISOString().slice(0, 10),
    };
}

export default function AddSupplyDialog({ open, onOpenChange, categories = [], paymentMethods = [], onAddSupply }) {
    const [form, setForm] = React.useState(getDefaultAddSupplyForm);

    const handleDialogOpenChange = React.useCallback(
        (next) => {
            if (!next) setForm(getDefaultAddSupplyForm());
            onOpenChange(next);
        },
        [onOpenChange],
    );

    React.useEffect(() => {
        if (open) setForm(getDefaultAddSupplyForm());
    }, [open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const qty = parseFloat(form.quantity) || 0;
        const cost = parseFloat(form.unitCost) || 0;
        const weight = form.weight ? parseFloat(form.weight) : null;
        const purchaseDate = form.purchaseDate || new Date().toISOString().slice(0, 10);
        const value = qty * cost;
        const supplyDraft = {
            category: form.category,
            name: form.name,
            quantity: qty,
            weight,
            unit: form.unit,
            unitCost: cost,
            purchasedFrom: form.purchasedFrom || '—',
            paymentMethod: form.paymentMethod,
            purchasedBy: form.purchasedBy || '—',
            value,
            lastPurchasedAt: purchaseDate,
        };
        const historyEntry = {
            id: `PH-${Date.now()}`,
            date: purchaseDate,
            name: form.name,
            category: form.category,
            quantity: qty,
            weight: weight ?? undefined,
            purchasedFrom: form.purchasedFrom || '—',
            paymentMethod: form.paymentMethod,
            purchasedBy: form.purchasedBy || '—',
            cost: value,
        };
        onAddSupply?.(supplyDraft, historyEntry);
        handleDialogOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogOpenChange}>
            <DialogContent className="border-zinc-700/80 bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-black/30 sm:max-w-xl overflow-hidden">
                <div
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500/60 via-indigo-500/30 to-transparent"
                    aria-hidden
                />
                <DialogHeader className="pb-3 border-b border-zinc-800/80">
                    <DialogTitle className="text-zinc-100 text-base font-semibold tracking-tight">Add Supply</DialogTitle>
                    <DialogDescription className="text-zinc-500 text-xs mt-0.5">
                        Log a new supply with details and purchase info
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="pt-3 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_minmax(0,8rem)] gap-3">
                        <div>
                            <Label className="text-zinc-500 text-[11px] font-medium">Name</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. Beef Brisket, Vacuum Bags"
                                className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                            />
                        </div>
                        <div>
                            <Label className="text-zinc-500 text-[11px] font-medium">Category</Label>
                            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                                <SelectTrigger className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c.value} value={c.value} className="text-sm">
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                            <Label className="text-zinc-500 text-[11px] font-medium">Qty</Label>
                            <Input
                                type="number"
                                step="any"
                                value={form.quantity}
                                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                                placeholder="50"
                                className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                            />
                        </div>
                        <div>
                            <Label className="text-zinc-500 text-[11px] font-medium">Weight (lb)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                value={form.weight}
                                onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                                placeholder="—"
                                className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                            />
                        </div>
                        <div>
                            <Label className="text-zinc-500 text-[11px] font-medium">Unit</Label>
                            <Select value={form.unit} onValueChange={(v) => setForm((f) => ({ ...f, unit: v }))}>
                                <SelectTrigger className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lb" className="text-sm">
                                        lb
                                    </SelectItem>
                                    <SelectItem value="pcs" className="text-sm">
                                        pcs
                                    </SelectItem>
                                    <SelectItem value="ea" className="text-sm">
                                        ea
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-zinc-500 text-[11px] font-medium">Unit Cost ($)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={form.unitCost}
                                onChange={(e) => setForm((f) => ({ ...f, unitCost: e.target.value }))}
                                placeholder="0.00"
                                className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20 tabular-nums"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label className="text-zinc-500 text-[11px] font-medium">Purchase Date</Label>
                            <Input
                                type="date"
                                value={form.purchaseDate}
                                onChange={(e) => setForm((f) => ({ ...f, purchaseDate: e.target.value }))}
                                className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20 [color-scheme:dark]"
                            />
                        </div>
                        <div>
                            <Label className="text-zinc-500 text-[11px] font-medium">Purchased From</Label>
                            <Input
                                value={form.purchasedFrom}
                                onChange={(e) => setForm((f) => ({ ...f, purchasedFrom: e.target.value }))}
                                placeholder="e.g. Restaurant Depot, Costco"
                                className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                            />
                        </div>
                        <div>
                            <Label className="text-zinc-500 text-[11px] font-medium">Payment Method</Label>
                            <Select
                                value={form.paymentMethod}
                                onValueChange={(v) => setForm((f) => ({ ...f, paymentMethod: v }))}
                            >
                                <SelectTrigger className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentMethods.map((p) => (
                                        <SelectItem key={p.value} value={p.value} className="text-sm">
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-zinc-500 text-[11px] font-medium">Purchased By</Label>
                            <Input
                                value={form.purchasedBy}
                                onChange={(e) => setForm((f) => ({ ...f, purchasedBy: e.target.value }))}
                                placeholder="e.g. John, Maria"
                                className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2 gap-2 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDialogOpenChange(false)}
                            className="border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            className="bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 text-sm font-medium"
                        >
                            Add Supply
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
