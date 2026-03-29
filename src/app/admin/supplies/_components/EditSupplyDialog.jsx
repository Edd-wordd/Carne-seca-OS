'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function formStateFromSupply(supply) {
    return {
        name: supply.name,
        category: supply.category,
        unit: supply.unit,
        description: supply.description ?? '',
        lowThreshold: supply.lowThreshold != null ? String(supply.lowThreshold) : '',
    };
}

export default function EditSupplyDialog({ open, onOpenChange, supply, categories = [], onSave }) {
    const [form, setForm] = React.useState({
        name: '',
        category: 'meat',
        unit: 'lb',
        description: '',
        lowThreshold: '',
    });

    React.useEffect(() => {
        if (open && supply) {
            setForm(formStateFromSupply(supply));
        }
    }, [open, supply]);

    const handleClose = React.useCallback(() => {
        onOpenChange(false);
    }, [onOpenChange]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!supply) return;
        const lowThreshold =
            form.lowThreshold === '' || form.lowThreshold == null ? null : parseFloat(form.lowThreshold);
        const updated = {
            ...supply,
            category: form.category,
            name: form.name,
            unit: form.unit,
            description: form.description || '',
            lowThreshold,
        };
        onSave?.(updated, supply);
        handleClose();
    };

    const dialogOpen = Boolean(open && supply);

    return (
        <Dialog
            open={dialogOpen}
            onOpenChange={(next) => {
                if (!next) handleClose();
            }}
        >
            <DialogContent className="border-zinc-700/80 bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-black/30 sm:max-w-xl overflow-hidden">
                <div
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500/60 via-amber-500/30 to-transparent"
                    aria-hidden
                />
                <DialogHeader className="pb-3 border-b border-zinc-800/80">
                    <DialogTitle className="text-zinc-100 text-base font-semibold tracking-tight">Edit Supply</DialogTitle>
                    <DialogDescription className="text-zinc-500 text-xs mt-0.5">
                        Update supply details shown in the table
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="pt-3 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_minmax(0,8rem)] gap-3">
                        <div>
                            <Label className="text-zinc-500 text-[11px] font-medium">Name</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. Beef Brisket"
                                className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-amber-500/50 focus-visible:ring-2 focus-visible:ring-amber-500/20"
                            />
                        </div>
                        <div>
                            <Label className="text-zinc-500 text-[11px] font-medium">Category</Label>
                            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                                <SelectTrigger className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm focus-visible:border-amber-500/50 focus-visible:ring-2 focus-visible:ring-amber-500/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c.value} value={c.value} className="text-sm">
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label className="text-zinc-500 text-[11px] font-medium">Unit</Label>
                            <Select value={form.unit} onValueChange={(v) => setForm((f) => ({ ...f, unit: v }))}>
                                <SelectTrigger className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm focus-visible:border-amber-500/50 focus-visible:ring-2 focus-visible:ring-amber-500/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lb" className="text-sm">
                                        lb
                                    </SelectItem>
                                    <SelectItem value="pcs" className="text-sm">
                                        pcs
                                    </SelectItem>
                                    <SelectItem value="ea" className="text-sm">
                                        ea
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-zinc-500 text-[11px] font-medium">Low Threshold</Label>
                            <Input
                                type="number"
                                step="any"
                                value={form.lowThreshold}
                                onChange={(e) => setForm((f) => ({ ...f, lowThreshold: e.target.value }))}
                                placeholder="e.g. 20"
                                className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-amber-500/50 focus-visible:ring-2 focus-visible:ring-amber-500/20 tabular-nums"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <Label className="text-zinc-500 text-[11px] font-medium">Description</Label>
                            <Input
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                placeholder="Add a short note about this supply"
                                className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-amber-500/50 focus-visible:ring-2 focus-visible:ring-amber-500/20"
                            />
                        </div>
                    </div>
                    <DialogFooter className="pt-2 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClose}
                            className="border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            className="bg-amber-600 text-white hover:bg-amber-500 shadow-lg shadow-amber-500/20 text-sm font-medium"
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
