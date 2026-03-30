'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { deleteSupply } from '@/app/actions/supplies/deleteSupply';
import { toast } from 'sonner';

export default function DeleteSupplyDialog({ open, onOpenChange, supply, onDeleted }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleOpenChange = React.useCallback(
        (next) => {
            if (!next) setIsDeleting(false);
            onOpenChange(next);
        },
        [onOpenChange],
    );

    const handleConfirm = async () => {
        if (!supply) return;
        setIsDeleting(true);
        try {
            const result = await deleteSupply(supply.id);
            if (!result?.success) {
                toast.error(result?.message ?? 'Failed to delete supply');
                return;
            }
            onDeleted?.(String(supply.id));
            toast.success(
                result.softDeleted
                    ? 'Supply hidden — it is still referenced by existing records'
                    : 'Supply deleted',
            );
            router.refresh();
            handleOpenChange(false);
        } catch (err) {
            toast.error(err?.message ?? 'Failed to delete supply');
        } finally {
            setIsDeleting(false);
        }
    };

    const dialogOpen = Boolean(open && supply);

    return (
        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="border-zinc-700/80 bg-zinc-900/95 sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100 text-base">Delete Supply</DialogTitle>
                    <DialogDescription className="text-zinc-500 text-sm">
                        Are you sure you want to delete <strong className="text-zinc-300">{supply?.name}</strong>? This
                        will remove it from the supply list. Purchase history will be kept for records.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={isDeleting}
                        onClick={() => handleOpenChange(false)}
                        className="border-zinc-700 text-zinc-400"
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        disabled={isDeleting}
                        onClick={() => void handleConfirm()}
                        className="bg-red-600 hover:bg-red-500 text-white disabled:opacity-60"
                    >
                        {isDeleting ? 'Deleting…' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
