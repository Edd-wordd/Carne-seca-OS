'use client';

import * as React from 'react';
import { addInventory } from '@/app/actions/inventory/addInventory';
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

export default function AddInventoryDialog({ open, onOpenChange, onSuccess }) {
    const mountedRef = React.useRef(true);
    React.useEffect(
        () => () => {
            mountedRef.current = false;
        },
        [],
    );

    const [newName, setNewName] = React.useState('');
    const [newStock, setNewStock] = React.useState('');
    const [newLowThreshold, setNewLowThreshold] = React.useState('');
    const [newCostPerBag, setNewCostPerBag] = React.useState('');
    const [newSellPrice, setNewSellPrice] = React.useState('');
    const [newConsignment, setNewConsignment] = React.useState('0');
    const [error, setError] = React.useState('');
    const [pending, setPending] = React.useState(false);

    React.useEffect(() => {
        if (!open) {
            setNewName('');
            setNewStock('');
            setNewLowThreshold('');
            setNewCostPerBag('');
            setNewSellPrice('');
            setNewConsignment('0');
            setError('');
        }
    }, [open]);

    const handleAddInventory = async () => {
        const stock = parseInt(newStock, 10) || 0;
        const lowThreshold = parseInt(newLowThreshold, 10) || 10;
        const costPerBag = parseFloat(String(newCostPerBag).replace(/[^0-9.]/g, '')) || 0;
        const sellPrice = parseFloat(String(newSellPrice).replace(/[^0-9.]/g, '')) || 0;
        if (!newName.trim()) return;
        setError('');
        setPending(true);
        const result = await addInventory({
            name: newName.trim(),
            stock,
            lowThreshold,
            consignment: parseInt(newConsignment, 10) || 0,
            costToAcquire: costPerBag,
            sellPrice,
        });
        setPending(false);
        if (!mountedRef.current) return;
        if (result.success) {
            onOpenChange(false);
            onSuccess?.();
        } else {
            setError(result.error ?? 'Failed to add inventory');
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => queueMicrotask(() => onOpenChange(o))}>
            <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Inventory</DialogTitle>
                    <DialogDescription>Add a new product to inventory.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Product name</label>
                        <Input
                            placeholder="Product name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                        />
                        <p className="text-xs text-zinc-500">SKU will be generated automatically.</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Stock</label>
                            <Input
                                type="number"
                                min={0}
                                placeholder="0"
                                value={newStock}
                                onChange={(e) => setNewStock(e.target.value)}
                                className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Low threshold</label>
                            <Input
                                type="number"
                                min={0}
                                placeholder="10"
                                value={newLowThreshold}
                                onChange={(e) => setNewLowThreshold(e.target.value)}
                                className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Consignment</label>
                            <Input
                                type="number"
                                min={0}
                                placeholder="0"
                                value={newConsignment}
                                onChange={(e) => setNewConsignment(e.target.value)}
                                className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Cost to acquire ($)</label>
                            <Input
                                placeholder="e.g. 5.50"
                                value={newCostPerBag}
                                onChange={(e) => setNewCostPerBag(e.target.value)}
                                className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Sell price ($)</label>
                            <Input
                                placeholder="e.g. 14.99"
                                value={newSellPrice}
                                onChange={(e) => setNewSellPrice(e.target.value)}
                                className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
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
                            onClick={handleAddInventory}
                            disabled={pending || !newName.trim()}
                            className="bg-indigo-600 text-white hover:bg-indigo-500"
                        >
                            {pending ? 'Adding...' : 'Add'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
