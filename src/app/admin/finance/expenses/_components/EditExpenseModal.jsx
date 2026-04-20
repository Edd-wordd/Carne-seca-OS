'use client';

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSuppliers } from '@/lib/supabase/queries/supplies/getSuppliers';
import { normalizeSuppliersList, VENDOR_ONE_OFF } from './expenseVendorUtils';

function dollarsFromCents(cents) {
    const n = (Number(cents) || 0) / 100;
    return String(n);
}

export function EditExpenseModal({
    expense,
    open,
    onOpenChange,
    categoryOptions,
    paymentMethodOptions,
    normalizePaymentMethod,
    isPending = false,
    onSave,
}) {
    const [date, setDate] = React.useState('');
    const [supplierSelect, setSupplierSelect] = React.useState('');
    const [customVendor, setCustomVendor] = React.useState('');
    const [suppliers, setSuppliers] = React.useState([]);
    const [suppliersLoading, setSuppliersLoading] = React.useState(false);
    const [category, setCategory] = React.useState('');
    const [note, setNote] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [paymentMethod, setPaymentMethod] = React.useState(() => paymentMethodOptions[0] ?? 'Cash');
    const [error, setError] = React.useState(null);

    const defaultCategory = categoryOptions[0] ?? '';
    const isOneOff = supplierSelect === VENDOR_ONE_OFF;

    React.useEffect(() => {
        if (!open || !expense) return;
        setDate(expense.date ?? '');
        setCategory(expense.category || defaultCategory);
        setNote(
            expense.note === '—' || expense.note == null
                ? ''
                : String(expense.note).trim(),
        );
        setAmount(dollarsFromCents(expense.amountCents));
        setPaymentMethod(normalizePaymentMethod(expense.paymentMethod));
        setError(null);
    }, [open, expense, defaultCategory, normalizePaymentMethod]);

    React.useEffect(() => {
        if (!open || !expense) return;
        const vid =
            expense.vendorId != null && String(expense.vendorId).trim() !== ''
                ? String(expense.vendorId).trim()
                : null;
        if (!vid) {
            setSupplierSelect(VENDOR_ONE_OFF);
            setCustomVendor(expense.vendor ?? '');
            return;
        }
        if (suppliers.length === 0) {
            setSupplierSelect('');
            setCustomVendor('');
            return;
        }
        const match = suppliers.find((s) => s.supplier_id === vid);
        if (match) {
            setSupplierSelect(vid);
            setCustomVendor('');
        } else {
            setSupplierSelect(VENDOR_ONE_OFF);
            setCustomVendor(expense.vendor ?? '');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- use expense id/vendor fields so parent re-renders with a new object ref do not fight in-progress edits
    }, [open, expense?.id, expense?.vendorId, expense?.vendor, suppliers]);

    React.useEffect(() => {
        if (!open) return;
        let cancelled = false;
        setSuppliersLoading(true);
        getSuppliers()
            .then((raw) => {
                if (cancelled) return;
                setSuppliers(normalizeSuppliersList(raw));
            })
            .catch(() => {
                if (!cancelled) setSuppliers([]);
            })
            .finally(() => {
                if (!cancelled) setSuppliersLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!expense || isPending) return;
        setError(null);
        if (!supplierSelect) {
            setError('Select a supplier or one-off vendor.');
            return;
        }
        let vendor;
        let vendorId = null;
        if (isOneOff) {
            const v = customVendor.trim();
            if (!v) {
                setError('Enter the vendor name for this one-off expense.');
                return;
            }
            vendor = v;
            vendorId = null;
        } else {
            const row = suppliers.find((s) => s.supplier_id === supplierSelect);
            if (!row) {
                setError('Selected supplier was not found. Try again or use one-off.');
                return;
            }
            vendor = row.name;
            vendorId = supplierSelect;
        }
        const parsed = Number.parseFloat(amount);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            setError('Enter a valid amount greater than zero.');
            return;
        }
        const amountCents = Math.round(parsed * 100);
        await onSave(expense.id, {
            date: date || expense.date,
            vendor,
            vendorId,
            category: category || defaultCategory,
            note: note.trim() || null,
            amountCents,
            paymentMethod,
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                onOpenChange(o);
                if (!o) setError(null);
            }}
        >
            <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">Edit expense</DialogTitle>
                    <DialogDescription className="text-xs text-zinc-500">
                        {expense ? (
                            <>
                                Update{' '}
                                <span className="font-mono text-zinc-400">
                                    {expense.expenseNumber?.trim() ? expense.expenseNumber : '—'}
                                </span>
                                .
                            </>
                        ) : null}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-expense-date" className="text-xs text-zinc-400">
                                Date
                            </Label>
                            <Input
                                id="edit-expense-date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="h-9 border-zinc-700 bg-zinc-950 text-xs text-zinc-100"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-expense-amount" className="text-xs text-zinc-400">
                                Amount (USD)
                            </Label>
                            <Input
                                id="edit-expense-amount"
                                type="number"
                                inputMode="decimal"
                                min="0.01"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="h-9 border-zinc-700 bg-zinc-950 text-xs text-zinc-100"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="edit-expense-vendor-supplier" className="text-xs text-zinc-400">
                            Vendor
                        </Label>
                        <select
                            id="edit-expense-vendor-supplier"
                            value={supplierSelect}
                            disabled={suppliersLoading}
                            onChange={(e) => {
                                const v = e.target.value;
                                setSupplierSelect(v);
                                if (v !== VENDOR_ONE_OFF) setCustomVendor('');
                            }}
                            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-xs text-zinc-100 shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <option value="">{suppliersLoading ? 'Loading suppliers…' : 'Select supplier…'}</option>
                            {suppliers.map((s) => (
                                <option key={s.supplier_id} value={s.supplier_id}>
                                    {s.name}
                                </option>
                            ))}
                            <option value={VENDOR_ONE_OFF}>Other (one-off vendor)</option>
                        </select>
                        {isOneOff ? (
                            <Input
                                id="edit-expense-vendor-custom"
                                placeholder="Vendor name (not in list)"
                                value={customVendor}
                                onChange={(e) => setCustomVendor(e.target.value)}
                                className="h-9 border-zinc-700 bg-zinc-950 text-xs text-zinc-100"
                                autoComplete="organization"
                            />
                        ) : null}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-expense-category" className="text-xs text-zinc-400">
                                Category
                            </Label>
                            <select
                                id="edit-expense-category"
                                value={category || defaultCategory}
                                onChange={(e) => setCategory(e.target.value)}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-xs text-zinc-100 shadow-xs outline-none focus-visible:ring-[3px]"
                            >
                                {categoryOptions.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-expense-payment" className="text-xs text-zinc-400">
                                Payment method
                            </Label>
                            <select
                                id="edit-expense-payment"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-xs text-zinc-100 shadow-xs outline-none focus-visible:ring-[3px]"
                            >
                                {paymentMethodOptions.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="edit-expense-note" className="text-xs text-zinc-400">
                            Note
                        </Label>
                        <Input
                            id="edit-expense-note"
                            placeholder="What was purchased?"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="h-9 border-zinc-700 bg-zinc-950 text-xs text-zinc-100"
                        />
                    </div>

                    {error ? <p className="text-xs text-red-400">{error}</p> : null}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                        >
                            {isPending ? 'Saving…' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
