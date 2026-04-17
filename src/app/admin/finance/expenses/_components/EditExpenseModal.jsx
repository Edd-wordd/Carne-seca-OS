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
import { PAYMENT_METHOD_OPTIONS, normalizePaymentMethod } from './expensePaymentMethods';

function dollarsFromCents(cents) {
    const n = (Number(cents) || 0) / 100;
    return String(n);
}

export function EditExpenseModal({ expense, open, onOpenChange, categoryOptions, onSave }) {
    const [date, setDate] = React.useState('');
    const [vendor, setVendor] = React.useState('');
    const [category, setCategory] = React.useState('');
    const [note, setNote] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [paymentMethod, setPaymentMethod] = React.useState('Card');
    const [error, setError] = React.useState(null);

    const defaultCategory = categoryOptions[0] ?? '';

    React.useEffect(() => {
        if (!open || !expense) return;
        setDate(expense.date ?? '');
        setVendor(expense.vendor ?? '');
        setCategory(expense.category || defaultCategory);
        setNote(expense.note === '—' ? '' : (expense.note ?? ''));
        setAmount(dollarsFromCents(expense.amountCents));
        setPaymentMethod(normalizePaymentMethod(expense.paymentMethod));
        setError(null);
    }, [open, expense, defaultCategory]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!expense) return;
        setError(null);
        const v = vendor.trim();
        if (!v) {
            setError('Vendor is required.');
            return;
        }
        const parsed = Number.parseFloat(amount);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            setError('Enter a valid amount greater than zero.');
            return;
        }
        const amountCents = Math.round(parsed * 100);
        onSave(expense.id, {
            date: date || expense.date,
            vendor: v,
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
                    <DialogTitle className="text-zinc-100">Edit expense</DialogTitle>
                    <DialogDescription className="text-xs text-zinc-500">
                        {expense ? (
                            <>
                                Update <span className="font-mono text-zinc-400">{expense.id}</span>. Session only
                                (mock UI).
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
                        <Label htmlFor="edit-expense-vendor" className="text-xs text-zinc-400">
                            Vendor
                        </Label>
                        <Input
                            id="edit-expense-vendor"
                            placeholder="Who was paid?"
                            value={vendor}
                            onChange={(e) => setVendor(e.target.value)}
                            className="h-9 border-zinc-700 bg-zinc-950 text-xs text-zinc-100"
                        />
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
                                {PAYMENT_METHOD_OPTIONS.map((m) => (
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
                        <Button type="submit" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
