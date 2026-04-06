'use client';

import * as React from 'react';
import { adjustStock } from '@/app/actions/inventory/adjustStock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

export default function AdjustStockDialog({ open, onOpenChange, productId, inventory, onSuccess }) {
    const mountedRef = React.useRef(true);
    React.useEffect(
        () => () => {
            mountedRef.current = false;
        },
        [],
    );

    const [adjustType, setAdjustType] = React.useState('add');
    const [adjustQuantity, setAdjustQuantity] = React.useState('');
    const [adjustNotes, setAdjustNotes] = React.useState('');
    const [adjustReason, setAdjustReason] = React.useState('');
    const [error, setError] = React.useState('');
    const [pending, setPending] = React.useState(false);

    React.useEffect(() => {
        if (!open) {
            setAdjustType('add');
            setAdjustQuantity('');
            setAdjustNotes('');
            setAdjustReason('');
            setError('');
        }
    }, [open]);

    const handleAdjustStock = async () => {
        const qty = parseInt(adjustQuantity, 10) || 0;
        if (!productId || qty <= 0) return;
        if (adjustType === 'remove' && !adjustReason) return;
        setError('');
        setPending(true);
        const result = await adjustStock({
            productId,
            adjustType,
            quantity: qty,
            reason: adjustReason,
            notes: adjustNotes,
        });
        setPending(false);
        if (!mountedRef.current) return;
        if (result.success) {
            onOpenChange(false);
            onSuccess?.();
        } else {
            setError(result.error ?? 'Failed to adjust stock');
        }
    };

    const product = inventory?.find((p) => p.id === productId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Adjust Stock</DialogTitle>
                    <DialogDescription>
                        {product ? `Add or remove stock for ${product.name}.` : 'Add or remove stock for a product.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    {product && (
                        <div className="rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2">
                            <p className="text-[10px] text-zinc-500">Product</p>
                            <p className="text-sm font-medium text-zinc-200">
                                {product.sku} — {product.name} (stock: {product.stock})
                            </p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Type</label>
                            <Select
                                value={adjustType}
                                onValueChange={(v) => {
                                    setAdjustType(v);
                                    if (v === 'add') setAdjustReason('');
                                }}
                            >
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
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">
                            Reason {adjustType === 'remove' ? '(records loss)' : '(for removals)'}
                        </label>
                        <Select value={adjustReason} onValueChange={setAdjustReason} disabled={adjustType === 'add'}>
                            <SelectTrigger className="border-zinc-700 bg-zinc-900/80 text-zinc-100">
                                <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="spoiled">Spoiled</SelectItem>
                                <SelectItem value="donated">Donated</SelectItem>
                                <SelectItem value="given_away">Given Away</SelectItem>
                                <SelectItem value="lost">Lost</SelectItem>
                                <SelectItem value="correction">Correction</SelectItem>
                                <SelectItem value="guest_satisfaction">Guest Satisfaction</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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
                <DialogFooter className="flex-col gap-2">
                    {error && <p className="text-xs text-red-400 text-left w-full">{error}</p>}
                    <div className="flex gap-2 justify-end w-full">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAdjustStock}
                            disabled={
                                pending ||
                                !adjustQuantity ||
                                parseInt(adjustQuantity, 10) <= 0 ||
                                (adjustType === 'remove' && !adjustReason)
                            }
                            className="bg-indigo-600 text-white hover:bg-indigo-500"
                        >
                            {pending ? 'Applying...' : 'Apply'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
