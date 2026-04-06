'use client';

import * as React from 'react';
import { updatedInventory } from '@/app/actions/inventory/updateInventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

export default function EditInventoryDialog({ open, onOpenChange, product, onSuccess }) {
    const [editForm, setEditForm] = React.useState({ lowThreshold: '' });
    const [error, setError] = React.useState('');
    const [pending, setPending] = React.useState(false);

    React.useEffect(() => {
        if (product) setEditForm({ lowThreshold: String(product.lowThreshold ?? '') });
        if (!open) setError('');
    }, [product, open]);

    const handleUpdateInventory = async (e) => {
        e.preventDefault();
        if (!product) return;
        const lowThresholdVal = parseInt(editForm.lowThreshold, 10);
        const lowThreshold = Number.isNaN(lowThresholdVal) ? (product.lowThreshold ?? 10) : lowThresholdVal;
        setError('');
        setPending(true);
        const result = await updatedInventory({ productId: product.id, lowThreshold });
        setPending(false);
        if (result.success) {
            onOpenChange(false);
            onSuccess?.();
        } else {
            setError(result.message ?? 'Failed to update inventory');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Inventory</DialogTitle>
                    <DialogDescription>Update {product?.name ?? 'product'} details.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateInventory} className="grid gap-4 py-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Low threshold</label>
                        <Input
                            type="number"
                            min={0}
                            placeholder="10"
                            value={editForm.lowThreshold}
                            onChange={(e) => setEditForm((f) => ({ ...f, lowThreshold: e.target.value }))}
                            className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                        />
                    </div>
                    <DialogFooter className="flex-col gap-2">
                        {error && <p className="text-xs text-red-400 text-left w-full">{error}</p>}
                        <div className="flex gap-2 justify-end w-full">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={pending}
                                className="bg-indigo-600 text-white hover:bg-indigo-500"
                            >
                                {pending ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
