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
import { Plus } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { createProductionBatch } from '@/app/actions/createProductionBatch';
import { useSentryCapture } from '@/lib/sentry/use-sentry-capture';

export default function CreateBatchDialog({ suppliers = [], onSuccess }) {
    const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
    const [confirmBatchOpen, setConfirmBatchOpen] = React.useState(false);
    const createBatchFormRef = React.useRef(null);
    const [state, formAction] = React.useActionState(createProductionBatch, null);
    const [newSupplier, setNewSupplier] = React.useState('');
    const [newRawWeight, setNewRawWeight] = React.useState('');
    const [newCost, setNewCost] = React.useState('');
    const [newSupplierName, setNewSupplierName] = React.useState('');
    const [newSupplierAddress, setNewSupplierAddress] = React.useState('');
    const [newSupplierPhone, setNewSupplierPhone] = React.useState('');
    const [newSupplierEmail, setNewSupplierEmail] = React.useState('');
    const [supplierNameError, setSupplierNameError] = React.useState('');
    const [supplierPhoneError, setSupplierPhoneError] = React.useState('');
    const [supplierEmailError, setSupplierEmailError] = React.useState('');
    const [toastVisible, setToastVisible] = React.useState(false);
    const { captureMessage } = useSentryCapture('CreateBatchDialog');

    const isNewSupplier = newSupplier === '__new__';

    const validateSupplierName = (value) => {
        if (/\d/.test(value)) {
            setSupplierNameError('Name cannot contain numbers');
            return false;
        }
        setSupplierNameError('');
        return true;
    };

    const validateSupplierPhone = (value) => {
        if (value && /[a-zA-Z]/.test(value)) {
            setSupplierPhoneError('Phone cannot contain letters');
            return false;
        }
        setSupplierPhoneError('');
        return true;
    };

    const validateSupplierEmail = (value) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setSupplierEmailError('Please enter a valid email');
            return false;
        }
        setSupplierEmailError('');
        return true;
    };

    const isNewSupplierValid =
        !isNewSupplier ||
        (newSupplierName.trim() &&
            !supplierNameError &&
            !supplierPhoneError &&
            !supplierEmailError &&
            (!newSupplierEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newSupplierEmail)) &&
            (!newSupplierPhone || !/[a-zA-Z]/.test(newSupplierPhone)));

    const costPerPound = newCost && parseFloat(newCost) >= 0 ? parseFloat(newCost) : 0;
    const supplierName = isNewSupplier
        ? newSupplierName
        : (suppliers.find((s) => s.supplier_id === newSupplier)?.name ?? newSupplier);
    const confirmSummary =
        newSupplier && newRawWeight
            ? `Confirming: ${parseFloat(newRawWeight).toFixed(1)} lbs from ${supplierName} at ${formatCurrency(costPerPound)}/lb. `
            : '';

    React.useEffect(() => {
        if (state?.success) {
            setCreateDialogOpen(false);
            setConfirmBatchOpen(false);
            setNewSupplier('');
            setNewRawWeight('');
            setNewCost('');
            setNewSupplierName('');
            setNewSupplierAddress('');
            setNewSupplierPhone('');
            setNewSupplierEmail('');
            onSuccess?.();
            setToastVisible(true);
            const t = setTimeout(() => setToastVisible(false), 4000);
            return () => clearTimeout(t);
        } else {
            if (state?.message) captureMessage(state.message);
            setToastVisible(false);
        }
    }, [state, onSuccess]);

    React.useEffect(() => {
        if (createDialogOpen) setToastVisible(false);
    }, [createDialogOpen]);

    return (
        <>
            <Button
                size="sm"
                className="gap-1.5 bg-indigo-600 text-white hover:bg-indigo-500 text-xs"
                onClick={() => setCreateDialogOpen(true)}
            >
                <Plus className="size-4" />
                Create Batch
            </Button>

            {toastVisible && state?.success && (
                <div
                    className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right fade-in-0 duration-300 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 shadow-lg"
                    role="status"
                >
                    {state.message}
                </div>
            )}

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
                    <form ref={createBatchFormRef} onSubmit={() => setConfirmBatchOpen(false)} action={formAction}>
                        <input type="hidden" name="yieldPercent" value="0" />
                        <DialogHeader>
                            <DialogTitle className="text-zinc-100">Create New Batch</DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                Add a new raw batch to production tracking.
                            </DialogDescription>
                        </DialogHeader>
                        {state && !state.success && (
                            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {state.message}
                            </div>
                        )}
                        <div className="space-y-6 py-6">
                            <div className="space-y-2.5">
                                <label className="text-sm font-medium text-zinc-300">Supplier</label>
                                <select
                                    name="supplierId"
                                    value={newSupplier}
                                    onChange={(e) => setNewSupplier(e.target.value)}
                                    className="flex h-9 w-full items-center justify-between rounded-md border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-500"
                                >
                                    <option value="">Select supplier</option>
                                    {suppliers.map((supplier) => (
                                        <option key={supplier.supplier_id} value={supplier.supplier_id}>
                                            {supplier.name}
                                        </option>
                                    ))}
                                    <option value="__new__">Add new supplier</option>
                                </select>
                            </div>
                            {isNewSupplier && (
                                <div className="space-y-5 rounded-lg border border-zinc-700/80 bg-zinc-800/50 p-5">
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                        New supplier details
                                    </p>
                                    <div className="grid gap-5">
                                        <div className="space-y-2.5">
                                            <label className="text-sm font-medium text-zinc-300">Name</label>
                                            <Input
                                                name="newSupplierName"
                                                value={newSupplierName}
                                                onChange={(e) => {
                                                    setNewSupplierName(e.target.value);
                                                    validateSupplierName(e.target.value);
                                                }}
                                                placeholder="Supplier name"
                                                className={cn(
                                                    'border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500',
                                                    supplierNameError && 'border-red-500',
                                                )}
                                            />
                                            {supplierNameError && (
                                                <p className="text-xs text-red-400">{supplierNameError}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-sm font-medium text-zinc-300">Address</label>
                                            <Input
                                                name="newSupplierAddress"
                                                value={newSupplierAddress}
                                                onChange={(e) => setNewSupplierAddress(e.target.value)}
                                                placeholder="Street address"
                                                className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-2.5">
                                                <label className="text-sm font-medium text-zinc-300">Phone</label>
                                                <Input
                                                    name="newSupplierPhone"
                                                    type="tel"
                                                    value={newSupplierPhone}
                                                    onChange={(e) => {
                                                        setNewSupplierPhone(e.target.value);
                                                        validateSupplierPhone(e.target.value);
                                                    }}
                                                    placeholder="(555) 555-5555"
                                                    className={cn(
                                                        'border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500',
                                                        supplierPhoneError && 'border-red-500',
                                                    )}
                                                />
                                                {supplierPhoneError && (
                                                    <p className="text-xs text-red-400">{supplierPhoneError}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="text-sm font-medium text-zinc-300">Email</label>
                                                <Input
                                                    name="newSupplierEmail"
                                                    type="email"
                                                    value={newSupplierEmail}
                                                    onChange={(e) => {
                                                        setNewSupplierEmail(e.target.value);
                                                        validateSupplierEmail(e.target.value);
                                                    }}
                                                    placeholder="email@example.com"
                                                    className={cn(
                                                        'border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500',
                                                        supplierEmailError && 'border-red-500',
                                                    )}
                                                />
                                                {supplierEmailError && (
                                                    <p className="text-xs text-red-400">{supplierEmailError}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2.5">
                                    <label className="text-sm font-medium text-zinc-300">Raw Weight (lbs)</label>
                                    <Input
                                        name="rawWeight"
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        placeholder="e.g. 45.5"
                                        value={newRawWeight}
                                        onChange={(e) => setNewRawWeight(e.target.value)}
                                        className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-sm font-medium text-zinc-300">Cost Per Pound</label>
                                    <div className="flex h-10 items-center rounded-md border border-zinc-700 bg-zinc-900/80">
                                        <span className="pl-3 text-sm text-zinc-400">$</span>
                                        <Input
                                            name="costPerPound"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={newCost}
                                            onChange={(e) => setNewCost(e.target.value)}
                                            className="h-full flex-1 border-0 bg-transparent pr-3 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setCreateDialogOpen(false)}
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={!newRawWeight || !newSupplier || !isNewSupplierValid}
                                className="bg-indigo-600 text-white hover:bg-indigo-500"
                                type="button"
                                onClick={() => setConfirmBatchOpen(true)}
                            >
                                Create Batch
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={confirmBatchOpen} onOpenChange={setConfirmBatchOpen}>
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-100">Confirm Batch</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Please confirm the batch details before submitting.
                        </DialogDescription>
                    </DialogHeader>
                    <p className="py-4 text-sm text-zinc-200">{confirmSummary}</p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmBatchOpen(false)}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            className="bg-indigo-600 text-white hover:bg-indigo-500"
                            onClick={() => {
                                setConfirmBatchOpen(false);
                                createBatchFormRef.current?.requestSubmit();
                            }}
                        >
                            Confirm & Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
