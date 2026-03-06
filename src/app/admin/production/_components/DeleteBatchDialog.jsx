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
import { AlertTriangle, Trash2 } from 'lucide-react';
import { deleteBatch } from '@/app/actions/deleteBatch';
import { formatCurrency } from '@/lib/utils';

export default function DeleteBatchDialog({ open, onOpenChange, batchToDelete, onSuccess }) {
    const [deleteToastVisible, setDeleteToastVisible] = React.useState(false);
    const [deleteToastMessage, setDeleteToastMessage] = React.useState('');

    return (
        <>
            {deleteToastVisible && (
                <div
                    className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right fade-in-0 duration-300 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 shadow-lg"
                    role="status"
                >
                    {deleteToastMessage}
                </div>
            )}

            <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onOpenChange(null)}>
                <DialogContent className="bg-zinc-900 border-zinc-700 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-100 flex items-center gap-2">
                            <AlertTriangle className="size-5 text-red-400" />
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            This action cannot be undone. This will permanently delete the batch and all associated
                            data.
                        </DialogDescription>
                    </DialogHeader>

                    {batchToDelete && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 my-2">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Batch ID</span>
                                    <span className="font-mono text-zinc-200">{batchToDelete.batch_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Supplier</span>
                                    <span className="text-zinc-200">
                                        {batchToDelete.suppliers?.name ?? batchToDelete.supplier_name ?? '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Raw Weight</span>
                                    <span className="text-zinc-200">{batchToDelete.raw_weight?.toFixed(1)} lbs</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Total Cost</span>
                                    <span className="text-zinc-200">
                                        {formatCurrency(
                                            batchToDelete.total_cost ??
                                                (batchToDelete.initial_weight * batchToDelete.cost_per_pound),
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-3">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(null)}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={!batchToDelete}
                            onClick={async () => {
                                if (!batchToDelete) return;
                                const batchNumber = batchToDelete.batch_number;
                                const id = batchToDelete.production_id ?? batchToDelete.id;
                                onOpenChange(null);
                                await deleteBatch(id);
                                onSuccess?.();
                                setDeleteToastMessage(`Batch ${batchNumber} deleted successfully`);
                                setDeleteToastVisible(true);
                                setTimeout(() => setDeleteToastVisible(false), 4000);
                            }}
                            className="bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
                        >
                            <Trash2 className="size-4 mr-1.5" />
                            Delete Batch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
