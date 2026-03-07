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
import { updateBatch } from '@/app/actions/updateBatch';
import { useSentryCapture } from '@/lib/sentry/use-sentry-capture';

export default function EditBatchDialog({ open, onOpenChange, batchToEdit, onSuccess }) {
    const [editRawWeight, setEditRawWeight] = React.useState('');
    const [editCostPerPound, setEditCostPerPound] = React.useState('');
    const [editToastVisible, setEditToastVisible] = React.useState(false);
    const [editToastMessage, setEditToastMessage] = React.useState('');
    const { captureError, captureMessage } = useSentryCapture('EditBatchDialog');

    React.useEffect(() => {
        if (batchToEdit) {
            setEditRawWeight(String(batchToEdit.raw_weight ?? ''));
            setEditCostPerPound(String(batchToEdit.cost_per_pound ?? ''));
        }
    }, [batchToEdit]);

    return (
        <>
            {editToastVisible && (
                <div
                    className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right fade-in-0 duration-300 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 shadow-lg"
                    role="status"
                >
                    {editToastMessage}
                </div>
            )}

            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-100">Edit Batch</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Edit batch details for the selected production batch.
                        </DialogDescription>
                    </DialogHeader>
                    {batchToEdit && (
                        <div className="space-y-5 py-4">
                            <div className="rounded-md border border-zinc-700/50 bg-zinc-800/50 px-3 py-2">
                                <p className="text-xs text-zinc-500">Batch</p>
                                <p className="font-mono text-sm text-zinc-200">{batchToEdit.batch_number}</p>
                                <p className="text-xs text-zinc-400">{batchToEdit.suppliers?.name ?? '—'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2.5">
                                    <label className="text-sm font-medium text-zinc-300">Raw Weight (lbs)</label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        value={editRawWeight}
                                        onChange={(e) => setEditRawWeight(e.target.value)}
                                        className="border-zinc-700 bg-zinc-900/80 text-zinc-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-sm font-medium text-zinc-300">Cost Per Pound</label>
                                    <div className="flex h-10 items-center rounded-md border border-zinc-700 bg-zinc-900/80">
                                        <span className="pl-3 text-sm text-zinc-400">$</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={editCostPerPound}
                                            onChange={(e) => setEditCostPerPound(e.target.value)}
                                            className="h-full flex-1 border-0 bg-transparent pr-3 text-zinc-100 focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={async () => {
                                        const batchNumber = batchToEdit.batch_number;
                                        try {
                                            const result = await updateBatch(
                                                batchToEdit.production_id,
                                                parseFloat(editRawWeight),
                                                parseFloat(editCostPerPound),
                                            );
                                            if (result.success) {
                                                onOpenChange(false);
                                                onSuccess?.();
                                                setEditToastMessage(`Batch ${batchNumber} updated successfully`);
                                                setEditToastVisible(true);
                                                setTimeout(() => setEditToastVisible(false), 4000);
                                            } else {
                                                captureMessage(result.message);
                                            }
                                        } catch (err) {
                                            captureError(err);
                                        }
                                    }}
                                    className="bg-indigo-600 text-white hover:bg-indigo-500"
                                >
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
