'use client';

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Package, Scale, Trash2 } from 'lucide-react';
import { cn, formatCurrency, getYieldBadgeConfig } from '@/lib/utils/helpers';
import { convertToFinishedGoods } from '@/app/actions/production/convertToFinishedGoods';
import { useSentryCapture } from '@/lib/sentry/use-sentry-capture';
import { usePosthogCapture } from '@/lib/posthog/use-posthog-capture';

export default function ConvertBatchDialog({ open, onOpenChange, selectedBatch, products = [], onSuccess }) {
    const [flavorSplits, setFlavorSplits] = React.useState([{ id: 1, product: '', bags: '' }]);
    const [isPending, setIsPending] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [successToastVisible, setSuccessToastVisible] = React.useState(false);
    const { captureError, captureMessage } = useSentryCapture('ConvertBatchDialog');
    const capture = usePosthogCapture('ConvertBatchDialog');

    React.useEffect(() => {
        if (selectedBatch) {
            setFlavorSplits([{ id: 1, product: '', bags: '' }]);
            setErrorMessage('');
        }
    }, [selectedBatch]);

    React.useEffect(() => {
        if (!open) setErrorMessage('');
    }, [open]);

    // Single source of truth for dried weight and yield — computed once, used everywhere
    const { driedLbs, yieldPct } = React.useMemo(() => {
        const lbs = flavorSplits.reduce((sum, s) => {
            const bags = parseInt(s.bags) || 0;
            const product = products.find((p) => String(p.id) === String(s.product));
            const grams = product?.size_grams || 0;
            return sum + (bags * grams) / 453.592;
        }, 0);
        const pct = selectedBatch?.raw_weight ? (lbs / selectedBatch.raw_weight) * 100 : 0;
        return { driedLbs: lbs, yieldPct: pct };
    }, [flavorSplits, products, selectedBatch]);

    // Use the same yield config as the table for consistency
    const yieldConfig = getYieldBadgeConfig(yieldPct / 100);

    const handleConvert = async () => {
        if (!selectedBatch || isPending) return;

        // Guard against stale products
        const splits = flavorSplits.map((split) => {
            const product = products.find((p) => String(p.id) === String(split.product));
            return {
                flavor: product?.flavor || '',
                size_grams: product?.size_grams || 0,
                bags: parseInt(split.bags, 10) || 0,
            };
        });

        const hasInvalidSplit = splits.some((s) => !s.flavor || s.size_grams === 0 || s.bags <= 0);
        if (hasInvalidSplit) {
            setErrorMessage('One or more splits are invalid. Please reselect products and try again.');
            return;
        }

        setIsPending(true);
        setErrorMessage('');

        try {
            const res = await convertToFinishedGoods(selectedBatch.production_id, splits);

            if (res?.success) {
                capture('batchConverted', {
                    production_id: selectedBatch.production_id,
                    batch_number: selectedBatch.batch_number,
                    raw_weight: selectedBatch.raw_weight,
                    splits,
                    total_bags: splits.reduce((sum, s) => sum + s.bags, 0),
                    yield_percent: yieldPct.toFixed(1),
                    supplier: selectedBatch.suppliers?.name ?? '',
                });
                onOpenChange(false);
                setFlavorSplits([{ id: 1, product: '', bags: '' }]);
                onSuccess?.();
                setSuccessToastVisible(true);
                setTimeout(() => setSuccessToastVisible(false), 4000);
            } else {
                const msg = res?.message ?? 'Failed to convert batch.';
                captureMessage(msg);
                setErrorMessage(msg);
            }
        } catch (err) {
            captureError(err);
            setErrorMessage('Something went wrong. Please try again.');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <>
            {successToastVisible && (
                <div
                    className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right fade-in-0 duration-300 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 shadow-lg"
                    role="status"
                >
                    Batch converted to finished goods successfully
                </div>
            )}

            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-100">Convert to Finished Goods</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Convert raw batch to finished inventory.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedBatch && (
                        <div className="space-y-6 py-4">
                            {/* Source Details */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 pb-1 border-b border-zinc-800">
                                    <Scale className="size-4 text-zinc-500" />
                                    <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                        Source Details
                                    </h3>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-zinc-500">Batch ID</label>
                                        <div className="flex h-9 items-center rounded-md border border-zinc-700/50 bg-zinc-800/50 px-3">
                                            <span className="font-mono text-sm text-zinc-300">
                                                {selectedBatch.batch_number ?? '—'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-zinc-500">Raw Weight</label>
                                        <div className="flex h-9 items-center rounded-md border border-zinc-700/50 bg-zinc-800/50 px-3">
                                            <span className="text-sm text-zinc-300 tabular-nums">
                                                {selectedBatch.raw_weight?.toFixed(1) ?? '—'} lbs
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-zinc-500">Cost / lb</label>
                                        <div className="flex h-9 items-center rounded-md border border-zinc-700/50 bg-zinc-800/50 px-3">
                                            <span className="text-sm text-zinc-300 tabular-nums">
                                                {formatCurrency(selectedBatch.cost_per_pound)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Flavor Splits */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <Package className="size-4 text-zinc-500" />
                                        <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                            Flavor Splits
                                        </h3>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setFlavorSplits([
                                                ...flavorSplits,
                                                { id: Date.now(), product: '', bags: '' },
                                            ])
                                        }
                                        className="h-7 px-2 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                                    >
                                        <Plus className="size-3 mr-1" />
                                        Add Flavor
                                    </Button>
                                </div>
                                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                                    {flavorSplits.map((split, index) => (
                                        <div
                                            key={split.id}
                                            className="flex items-center gap-2 rounded-md border border-zinc-700/50 bg-zinc-800/30 px-2 py-1.5"
                                        >
                                            <span className="text-[10px] font-medium text-zinc-500 w-4">
                                                {index + 1}
                                            </span>
                                            <Select
                                                value={split.product}
                                                onValueChange={(value) => {
                                                    setFlavorSplits(
                                                        flavorSplits.map((s) =>
                                                            s.id === split.id ? { ...s, product: value } : s,
                                                        ),
                                                    );
                                                }}
                                            >
                                                <SelectTrigger className="h-8 flex-1 border-zinc-700 bg-zinc-900/80 text-zinc-100 text-xs">
                                                    <SelectValue placeholder="Select product" />
                                                </SelectTrigger>
                                                <SelectContent className="border-zinc-700 bg-zinc-900 text-zinc-100">
                                                    {products
                                                        .filter((p) => p.category === 'carne_seca')
                                                        .map((product) => (
                                                            <SelectItem
                                                                key={product.id}
                                                                value={String(product.id)}
                                                                className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100"
                                                            >
                                                                {`${product.flavor} ${Math.round(product.size_grams / 28.3495)}oz`}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="bags"
                                                value={split.bags}
                                                onChange={(e) => {
                                                    setFlavorSplits(
                                                        flavorSplits.map((s) =>
                                                            s.id === split.id ? { ...s, bags: e.target.value } : s,
                                                        ),
                                                    );
                                                }}
                                                className="h-8 w-20 border-zinc-700 bg-zinc-900/80 text-zinc-100 text-xs placeholder:text-zinc-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                            />
                                            {flavorSplits.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setFlavorSplits(flavorSplits.filter((s) => s.id !== split.id))
                                                    }
                                                    className="h-6 w-6 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 ml-auto"
                                                >
                                                    <Trash2 className="size-3" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Summary */}
                                {flavorSplits.some((s) => s.product || s.bags) && (
                                    <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-3 mt-3">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-zinc-400">Dried Weight</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-zinc-300 font-medium">
                                                    {driedLbs.toFixed(2)} lbs
                                                </span>
                                                <span className="text-zinc-500">|</span>
                                                <span className="text-zinc-300">
                                                    {flavorSplits.reduce((sum, s) => sum + (parseInt(s.bags) || 0), 0)}{' '}
                                                    bags
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-zinc-700/50">
                                            <span className="text-zinc-400">Yield %</span>
                                            <span
                                                className={cn(
                                                    'font-medium',
                                                    yieldConfig.className.split(' ').find((c) => c.startsWith('text-')),
                                                )}
                                            >
                                                {yieldPct.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            {errorMessage}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConvert}
                            disabled={
                                isPending ||
                                !selectedBatch ||
                                flavorSplits.length === 0 ||
                                flavorSplits.some((s) => !s.product || !s.bags || parseInt(s.bags, 10) <= 0)
                            }
                            className="bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
                        >
                            <Package className="size-4 mr-1.5" />
                            {isPending ? 'Converting...' : 'Convert'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
