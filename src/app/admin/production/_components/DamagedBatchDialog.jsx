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
import { AlertTriangle } from 'lucide-react';
import { useTransition } from 'react';
import { handleDamagedGoods } from '@/app/actions/handleDamagedGoods';

export default function DamagedBatchDialog({ open, onOpenChange, batchToDamage, onSuccess }) {
    const [damagedType, setDamagedType] = React.useState('full');
    const [damagedWeight, setDamagedWeight] = React.useState('');
    const [damagedReason, setDamagedReason] = React.useState('');
    const [damagedToastVisible, setDamagedToastVisible] = React.useState(false);
    const [damagedToastMessage, setDamagedToastMessage] = React.useState('');
    const [isPending, startTransition] = useTransition();

    React.useEffect(() => {
        if (batchToDamage) {
            setDamagedType('full');
            setDamagedWeight('');
            setDamagedReason('');
        }
    }, [batchToDamage]);

    const onConfirm = () => {
        if (!batchToDamage) return;

        const batchNumber = batchToDamage.batch_number;
        const weight = damagedType === 'full' ? batchToDamage.raw_weight : parseFloat(damagedWeight);
        const isPartial = damagedType === 'partial';
        const productionId = batchToDamage.production_id;

        startTransition(async () => {
            const result = await handleDamagedGoods(productionId, weight, damagedReason);

            if (result.success) {
                onOpenChange(false);
                onSuccess?.();
                const toastMsg = isPartial
                    ? `Batch ${batchNumber} partially damaged (${weight} lbs)`
                    : `Batch ${batchNumber} marked as damaged`;
                setDamagedToastMessage(toastMsg);
                setDamagedToastVisible(true);
                setTimeout(() => setDamagedToastVisible(false), 4000);
            } else {
                console.error(result.message);
            }
        });
    };

    return (
        <>
            {damagedToastVisible && (
                <div
                    className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right fade-in-0 duration-300 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400 shadow-lg"
                    role="status"
                >
                    {damagedToastMessage}
                </div>
            )}

            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-100">Mark as Damaged</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Record damage for this production batch.
                        </DialogDescription>
                    </DialogHeader>
                    {batchToDamage && (
                        <div className="space-y-5 py-4">
                            <div className="rounded-md border border-zinc-700/50 bg-zinc-800/50 px-3 py-2">
                                <p className="text-xs text-zinc-500">Batch</p>
                                <p className="font-mono text-sm text-zinc-200">{batchToDamage.batch_number}</p>
                                <p className="text-xs text-zinc-400">
                                    {batchToDamage.raw_weight?.toFixed(1)} lbs — {batchToDamage.suppliers?.name ?? '—'}
                                </p>
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-sm font-medium text-zinc-300">Damage Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="damagedType"
                                            value="full"
                                            checked={damagedType === 'full'}
                                            onChange={() => setDamagedType('full')}
                                            className="size-4 accent-red-500"
                                        />
                                        <span className="text-sm text-zinc-200">Full Batch</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="damagedType"
                                            value="partial"
                                            checked={damagedType === 'partial'}
                                            onChange={() => setDamagedType('partial')}
                                            className="size-4 accent-amber-500"
                                        />
                                        <span className="text-sm text-zinc-200">Partial</span>
                                    </label>
                                </div>
                            </div>
                            {damagedType === 'partial' && (
                                <div className="space-y-2.5">
                                    <label className="text-sm font-medium text-zinc-300">
                                        Damaged Weight (lbs) <span className="text-red-400">*</span>
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        max={batchToDamage.raw_weight}
                                        placeholder={`Max: ${batchToDamage.raw_weight?.toFixed(1)}`}
                                        value={damagedWeight}
                                        onChange={(e) => setDamagedWeight(e.target.value)}
                                        required
                                        className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                    />
                                </div>
                            )}
                            <div className="space-y-2.5">
                                <label className="text-sm font-medium text-zinc-300">
                                    Reason <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={damagedReason}
                                    onChange={(e) => setDamagedReason(e.target.value)}
                                    placeholder="Describe the damage or cause..."
                                    rows={3}
                                    required
                                    className="flex w-full rounded-md border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-500 resize-none"
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={onConfirm}
                                    disabled={
                                        isPending ||
                                        !damagedReason.trim() ||
                                        (damagedType === 'partial' &&
                                            (!damagedWeight || parseFloat(damagedWeight) <= 0)) ||
                                        (damagedType === 'partial' &&
                                            parseFloat(damagedWeight) > batchToDamage.raw_weight)
                                    }
                                    className="bg-red-600 text-white hover:bg-red-500"
                                >
                                    <AlertTriangle className="size-4 mr-1.5" />
                                    {isPending ? 'Processing...' : 'Mark as Damaged'}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
