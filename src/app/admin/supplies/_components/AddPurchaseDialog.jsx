'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
import { addPurchase } from '@/app/actions/supplies/addPurchase';
import { toast } from 'sonner';

const SELECT_ADD_NEW = '__add_new__';

function getDefaultPurchaseForm() {
    return {
        date: new Date().toLocaleDateString('en-CA'),
        itemSelect: '',
        quantity: '',
        supplierSelect: '',
        newSupplierName: '',
        paymentMethod: 'credit_card',
        purchasedBy: '',
        cost: '',
    };
}

export default function AddPurchaseDialog({
    open,
    onOpenChange,
    supplies = [],
    suppliers = [],
    paymentMethods = [],
    onAddPurchase,
}) {
    const router = useRouter();
    const [purchaseForm, setPurchaseForm] = React.useState(getDefaultPurchaseForm);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleDialogOpenChange = React.useCallback(
        (next) => {
            if (!next) {
                setPurchaseForm(getDefaultPurchaseForm());
                setIsSubmitting(false);
            }
            onOpenChange(next);
        },
        [onOpenChange],
    );

    React.useEffect(() => {
        if (open) setPurchaseForm(getDefaultPurchaseForm());
    }, [open]);

    const isPurchaseNewSupplier = purchaseForm.supplierSelect === SELECT_ADD_NEW;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const qty = parseFloat(purchaseForm.quantity);
        const costVal = parseFloat(purchaseForm.cost);
        if (Number.isNaN(qty) || qty <= 0 || Number.isNaN(costVal) || costVal < 0) {
            toast.error('Enter valid quantity and unit cost');
            return;
        }
        const supplyId = purchaseForm.itemSelect.trim();
        if (!supplyId) {
            toast.error('Select a supply item');
            return;
        }
        const supplyRow = supplies.find((s) => String(s.id) === supplyId);
        if (!supplyRow) {
            toast.error('Selected supply was not found');
            return;
        }
        if (!purchaseForm.supplierSelect) {
            toast.error('Select a supplier');
            return;
        }
        if (isPurchaseNewSupplier) {
            const name = purchaseForm.newSupplierName.trim();
            if (!name) {
                toast.error('Enter the new supplier name');
                return;
            }
        }

        const date = purchaseForm.date || new Date().toISOString().slice(0, 10);
        const payment = purchaseForm.paymentMethod;
        const purchasedBy = purchaseForm.purchasedBy.trim() || '';

        setIsSubmitting(true);
        try {
            const result = await addPurchase({
                item: supplyId,
                date,
                quantity: qty,
                cost: costVal,
                supplier: purchaseForm.supplierSelect,
                payment,
                purchasedBy,
                newSupplier: isPurchaseNewSupplier ? purchaseForm.newSupplierName.trim() : undefined,
            });
            if (!result?.success) {
                toast.error(result?.message ?? 'Failed to add purchase');
                return;
            }

            const purchasedFromLabel = isPurchaseNewSupplier
                ? purchaseForm.newSupplierName.trim()
                : (suppliers.find((s) => String(s.supplier_id) === String(purchaseForm.supplierSelect))?.name ?? '—');

            const historyEntry = {
                id: `PH-${Date.now()}`,
                date,
                name: supplyRow.name,
                category: supplyRow.category,
                quantity: qty,
                unit_cost: costVal,
                cost: qty * costVal,
                purchasedFrom: purchasedFromLabel,
                paymentMethod: payment,
                purchasedBy: purchasedBy || '—',
            };
            onAddPurchase?.(historyEntry);
            toast.success('Purchase recorded');
            router.refresh();
            handleDialogOpenChange(false);
        } catch (err) {
            toast.error(err?.message ?? 'Failed to add purchase');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogOpenChange}>
            <DialogContent className="border-zinc-700/80 bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-black/30 sm:max-w-xl overflow-hidden">
                <div
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500/50 via-emerald-500/25 to-transparent"
                    aria-hidden
                />
                <DialogHeader className="pb-3 border-b border-zinc-800/80">
                    <DialogTitle className="text-zinc-100 text-base font-semibold tracking-tight">
                        Add purchase
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 text-xs mt-0.5">
                        Record a line in purchase history (same fields as the table below)
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="pt-3 space-y-4">
                    <div>
                        <Label className="text-zinc-500 text-[11px] font-medium">Item</Label>
                        <select
                            value={purchaseForm.itemSelect}
                            onChange={(e) => setPurchaseForm((f) => ({ ...f, itemSelect: e.target.value }))}
                            className="mt-1 flex h-9 w-full rounded-md border border-zinc-700/80 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                        >
                            <option value="">Select item</option>
                            {supplies.map((item) => (
                                <option key={item.id} value={String(item.id)}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                            <Label className="text-zinc-500 text-[11px] font-medium">Date</Label>
                            <Input
                                type="date"
                                value={purchaseForm.date}
                                onChange={(e) => setPurchaseForm((f) => ({ ...f, date: e.target.value }))}
                                className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20 [color-scheme:dark]"
                            />
                        </div>
                        <div>
                            <Label className="text-zinc-500 text-[11px] font-medium">Qty</Label>
                            <Input
                                type="number"
                                step="any"
                                value={purchaseForm.quantity}
                                onChange={(e) => setPurchaseForm((f) => ({ ...f, quantity: e.target.value }))}
                                placeholder="50"
                                className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20 tabular-nums"
                            />
                        </div>
                        <div>
                            <Label className="text-zinc-500 text-[11px] font-medium">Unit cost ($)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={purchaseForm.cost}
                                onChange={(e) => setPurchaseForm((f) => ({ ...f, cost: e.target.value }))}
                                placeholder="0.00"
                                className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20 tabular-nums"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                            <Label className="text-zinc-500 text-[11px] font-medium">Supplier</Label>
                            <select
                                value={purchaseForm.supplierSelect}
                                onChange={(e) =>
                                    setPurchaseForm((f) => ({
                                        ...f,
                                        supplierSelect: e.target.value,
                                        ...(e.target.value !== SELECT_ADD_NEW ? { newSupplierName: '' } : {}),
                                    }))
                                }
                                className="mt-1 flex h-9 w-full rounded-md border border-zinc-700/80 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                            >
                                <option value="">Select supplier</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.supplier_id} value={supplier.supplier_id}>
                                        {supplier.name}
                                    </option>
                                ))}
                                <option value={SELECT_ADD_NEW}>+ Add new</option>
                            </select>
                            {isPurchaseNewSupplier && (
                                <Input
                                    value={purchaseForm.newSupplierName}
                                    onChange={(e) =>
                                        setPurchaseForm((f) => ({ ...f, newSupplierName: e.target.value }))
                                    }
                                    placeholder="New supplier name"
                                    className="mt-2 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                                />
                            )}
                        </div>
                        <div>
                            <Label className="text-zinc-500 text-[11px] font-medium">Payment</Label>
                            <Select
                                value={purchaseForm.paymentMethod}
                                onValueChange={(v) => setPurchaseForm((f) => ({ ...f, paymentMethod: v }))}
                            >
                                <SelectTrigger className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20">
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
                            <Label className="text-zinc-500 text-[11px] font-medium">Purchased by</Label>
                            <Input
                                value={purchaseForm.purchasedBy}
                                onChange={(e) => setPurchaseForm((f) => ({ ...f, purchasedBy: e.target.value }))}
                                placeholder="e.g. John, Maria"
                                className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
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
                            disabled={isSubmitting}
                            className="bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 text-sm font-medium disabled:opacity-60"
                        >
                            {isSubmitting ? 'Saving…' : 'Add purchase'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
