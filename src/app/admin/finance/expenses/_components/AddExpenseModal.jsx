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

export function AddExpenseModal({ open, onOpenChange, categoryOptions, onAdd }) {
    const [date, setDate] = React.useState('');
    const [vendor, setVendor] = React.useState('');
    const [category, setCategory] = React.useState('');
    const [note, setNote] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [paymentMethod, setPaymentMethod] = React.useState('Card');
    const [error, setError] = React.useState(null);

    const defaultCategory = categoryOptions[0] ?? '';

    const reset = React.useCallback(() => {
        const today = new Date().toISOString().slice(0, 10);
        setDate(today);
        setVendor('');
        setCategory(defaultCategory);
        setNote('');
        setAmount('');
        setPaymentMethod('Card');
        setError(null);
    }, [defaultCategory]);

    React.useEffect(() => {
        if (open) reset();
    }, [open, reset]);

    const handleSubmit = (e) => {
        e.preventDefault();
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
        onAdd({
            date: date || new Date().toISOString().slice(0, 10),
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
                        <Label htmlFor="expense-vendor" className="text-xs text-zinc-400">
                            Vendor
                        </Label>
                        <Input
                            id="expense-vendor"
                            placeholder="Who was paid?"
                            value={vendor}
                            onChange={(e) => setVendor(e.target.value)}
                            className="h-9 border-zinc-700 bg-zinc-950 text-xs text-zinc-100"
                        />
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
