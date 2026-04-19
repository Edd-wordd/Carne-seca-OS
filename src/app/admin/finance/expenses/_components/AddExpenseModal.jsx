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
import { PAYMENT_METHOD_OPTIONS } from './expensePaymentMethods';
import { getSuppliers } from '@/lib/supabase/queries/supplies/getSuppliers';

const VENDOR_ONE_OFF = '__one_off__';

function normalizeSuppliersList(raw) {
    const list = Array.isArray(raw) ? raw : [];
    return list
        .map((s) => ({
            supplier_id: String(s.supplier_id ?? s.id ?? ''),
            name: String(s.name ?? '').trim(),
        }))
        .filter((s) => s.supplier_id && s.name)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

export function AddExpenseModal({ open, onOpenChange, categoryOptions, onAdd }) {
    const [date, setDate] = React.useState('');
    const [supplierSelect, setSupplierSelect] = React.useState('');
    const [customVendor, setCustomVendor] = React.useState('');
    const [suppliers, setSuppliers] = React.useState([]);
    const [suppliersLoading, setSuppliersLoading] = React.useState(false);
    const [category, setCategory] = React.useState('');
    const [note, setNote] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [paymentMethod, setPaymentMethod] = React.useState('Card');
    const [error, setError] = React.useState(null);

    const defaultCategory = categoryOptions[0] ?? '';
    const isOneOff = supplierSelect === VENDOR_ONE_OFF;

    const reset = React.useCallback(() => {
        const today = new Date().toISOString().slice(0, 10);
        setDate(today);
        setSupplierSelect('');
        setCustomVendor('');
        setCategory(defaultCategory);
        setNote('');
        setAmount('');
        setPaymentMethod('Card');
        setError(null);
    }, [defaultCategory]);

    React.useEffect(() => {
        if (open) reset();
    }, [open, reset]);

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

    const handleSubmit = (e) => {
        e.preventDefault();
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
        onAdd({
            date: date || new Date().toISOString().slice(0, 10),
            vendor,
            vendorId,
            category: category || defaultCategory,
            note: note.trim() || '—',
            amountCents,
            paymentMethod,
        });
        onOpenChange(false);
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
                    <DialogTitle className="text-zinc-100">Add expense</DialogTitle>
                    <DialogDescription className="text-xs text-zinc-500">
                        Log a spend entry. Saved locally in this session (mock UI).
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="expense-date" className="text-xs text-zinc-400">
                                Date
                            </Label>
                            <Input
                                id="expense-date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="h-9 border-zinc-700 bg-zinc-950 text-xs text-zinc-100"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="expense-amount" className="text-xs text-zinc-400">
                                Amount (USD)
                            </Label>
                            <Input
                                id="expense-amount"
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
                        <Label htmlFor="expense-vendor-supplier" className="text-xs text-zinc-400">
                            Vendor
                        </Label>
                        <select
                            id="expense-vendor-supplier"
                            value={supplierSelect}
                            disabled={suppliersLoading}
                            onChange={(e) => {
                                const v = e.target.value;
                                setSupplierSelect(v);
                                if (v !== VENDOR_ONE_OFF) setCustomVendor('');
                            }}
                            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-xs text-zinc-100 shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <option value="">
                                {suppliersLoading ? 'Loading suppliers…' : 'Select supplier…'}
                            </option>
                            {suppliers.map((s) => (
                                <option key={s.supplier_id} value={s.supplier_id}>
                                    {s.name}
                                </option>
                            ))}
                            <option value={VENDOR_ONE_OFF}>Other (one-off vendor)</option>
                        </select>
                        {isOneOff ? (
                            <Input
                                id="expense-vendor-custom"
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
                            <Label htmlFor="expense-category" className="text-xs text-zinc-400">
                                Category
                            </Label>
                            <select
                                id="expense-category"
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
                            <Label htmlFor="expense-payment" className="text-xs text-zinc-400">
                                Payment method
                            </Label>
                            <select
                                id="expense-payment"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-xs text-zinc-100 shadow-xs outline-none focus-visible:ring-[3px]"
                            >
                                {PAYMENT_METHOD_OPTIONS.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="expense-note" className="text-xs text-zinc-400">
                            Note
                        </Label>
                        <Input
                            id="expense-note"
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
                        <Button type="submit" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                            Save expense
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
