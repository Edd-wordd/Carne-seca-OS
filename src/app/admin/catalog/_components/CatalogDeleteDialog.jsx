'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function CatalogDeleteDialog({
    open,
    setOpen,
    deleteTarget,
    isDeleting,
    setDeleteTarget,
    handleDeleteProduct,
}) {
    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                if (!nextOpen && !isDeleting) setDeleteTarget(null);
            }}
        >
            <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Product</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete &quot;{deleteTarget?.name ?? 'this product'}&quot;? This action
                        cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isDeleting}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleDeleteProduct}
                        disabled={isDeleting}
                        className="bg-red-500/20 text-red-300 hover:bg-red-500/30"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
