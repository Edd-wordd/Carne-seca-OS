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
function formatCurrency(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format((Number(cents) || 0) / 100);
}

export function DeleteExpenseModal({
    expense,
    open,
    onOpenChange,
    normalizePaymentMethod,
    isPending = false,
    onConfirm,
}) {
    const handleDelete = async () => {
        if (!expense || isPending) return;
        await onConfirm(expense.id);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                onOpenChange(o);
            }}
        >
            <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">Delete expense</DialogTitle>
                    <DialogDescription className="text-xs text-zinc-400">
                        This marks the expense as deleted. It will no longer appear in this list.
                    </DialogDescription>
                </DialogHeader>
                {expense ? (
                    <p className="rounded border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-xs text-zinc-300">
                        <span className="font-mono text-zinc-400">{expense.id}</span>
                        {' · '}
                        {expense.vendor}
                        {' · '}
                        <span className="text-zinc-500">{normalizePaymentMethod(expense.paymentMethod)}</span>
                        {' · '}
                        <span className="tabular-nums text-red-400">{formatCurrency(expense.amountCents)}</span>
                    </p>
                ) : null}
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
                        type="button"
                        disabled={isPending}
                        className="bg-red-600 text-white hover:bg-red-500"
                        onClick={handleDelete}
                    >
                        {isPending ? 'Deleting…' : 'Delete expense'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
