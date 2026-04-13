'use client';

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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FULFILLMENT_OPTIONS, ORDER_SOURCES, formatCurrency } from './OrdersTable';

function orderDisplayId(order) {
    if (!order) return '';
    if (order.order_number != null && order.order_number !== '') return String(order.order_number);
    const id = order.id;
    if (id == null) return '';
    return String(id).slice(0, 8);
}

function orderItemsQuantitySum(order_items) {
    return (order_items ?? []).reduce((s, li) => s + (li.quantity ?? 0), 0);
}

export function OrderEditDialog({ open, editingOrder, editForm, setEditForm, onOpenChange, onSave, onCancel }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[min(90vh,640px)] overflow-y-auto border-zinc-800 bg-zinc-900 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit order</DialogTitle>
                    <DialogDescription>
                        {editingOrder ? `Update order ${orderDisplayId(editingOrder)}` : ''}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-order-customer" className="text-xs text-zinc-400">
                            Customer
                        </Label>
                        <Input
                            id="edit-order-customer"
                            value={editForm.customer ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, customer: e.target.value }))}
                            className="h-9 border-zinc-700 bg-zinc-950/80 text-zinc-100"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-order-email" className="text-xs text-zinc-400">
                            Email
                        </Label>
                        <Input
                            id="edit-order-email"
                            type="email"
                            autoComplete="email"
                            value={editForm.email ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                            className="h-9 border-zinc-700 bg-zinc-950/80 text-zinc-100"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-zinc-400">Source</Label>
                        <Select
                            value={editForm.source ?? 'website'}
                            onValueChange={(v) => setEditForm((f) => ({ ...f, source: v }))}
                        >
                            <SelectTrigger className="h-9 border-zinc-700 bg-zinc-950/80 text-zinc-100">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ORDER_SOURCES.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Shipping address</p>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-addr-line1" className="text-xs text-zinc-400">
                                Address line 1
                            </Label>
                            <Input
                                id="edit-addr-line1"
                                value={editForm.addressLine1 ?? ''}
                                onChange={(e) => setEditForm((f) => ({ ...f, addressLine1: e.target.value }))}
                                className="h-9 border-zinc-700 bg-zinc-950/80 text-zinc-100"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-addr-line2" className="text-xs text-zinc-400">
                                Address line 2
                            </Label>
                            <Input
                                id="edit-addr-line2"
                                value={editForm.addressLine2 ?? ''}
                                onChange={(e) => setEditForm((f) => ({ ...f, addressLine2: e.target.value }))}
                                className="h-9 border-zinc-700 bg-zinc-950/80 text-zinc-100"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-addr-city" className="text-xs text-zinc-400">
                                    City
                                </Label>
                                <Input
                                    id="edit-addr-city"
                                    value={editForm.city ?? ''}
                                    onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                                    className="h-9 border-zinc-700 bg-zinc-950/80 text-zinc-100"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-addr-state" className="text-xs text-zinc-400">
                                    State
                                </Label>
                                <Input
                                    id="edit-addr-state"
                                    value={editForm.state ?? ''}
                                    onChange={(e) => setEditForm((f) => ({ ...f, state: e.target.value }))}
                                    className="h-9 border-zinc-700 bg-zinc-950/80 text-zinc-100"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-addr-zip" className="text-xs text-zinc-400">
                                    ZIP
                                </Label>
                                <Input
                                    id="edit-addr-zip"
                                    value={editForm.zip ?? ''}
                                    onChange={(e) => setEditForm((f) => ({ ...f, zip: e.target.value }))}
                                    className="h-9 border-zinc-700 bg-zinc-950/80 text-zinc-100"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-addr-country" className="text-xs text-zinc-400">
                                    Country
                                </Label>
                                <Input
                                    id="edit-addr-country"
                                    value={editForm.country ?? ''}
                                    onChange={(e) => setEditForm((f) => ({ ...f, country: e.target.value }))}
                                    className="h-9 border-zinc-700 bg-zinc-950/80 text-zinc-100"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-b border-zinc-800/80 pb-3">
                        <div>
                            <p className="text-xs text-zinc-500">Items</p>
                            <p className="mt-0.5 text-sm font-medium tabular-nums text-zinc-200">
                                {editingOrder?.order_items?.length
                                    ? orderItemsQuantitySum(editingOrder.order_items)
                                    : (editingOrder?.items ?? 0)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500">Total</p>
                            <p className="mt-0.5 text-sm font-medium tabular-nums text-zinc-200">
                                {formatCurrency(editingOrder?.amount_total ?? 0)}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-zinc-400">Fulfillment</Label>
                        <Select
                            value={editForm.fulfillment ?? 'unfulfilled'}
                            onValueChange={(v) => setEditForm((f) => ({ ...f, fulfillment: v }))}
                            disabled={editingOrder?.refunded}
                        >
                            <SelectTrigger className="h-9 border-zinc-700 bg-zinc-950/80 text-zinc-100">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {FULFILLMENT_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-order-tracking" className="text-xs text-zinc-400">
                            Tracking
                        </Label>
                        <Input
                            id="edit-order-tracking"
                            value={editForm.tracking ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, tracking: e.target.value }))}
                            className="h-9 border-zinc-700 bg-zinc-950/80 font-mono text-xs text-zinc-100"
                        />
                    </div>
                </div>
                <DialogFooter className="gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={onSave}
                        className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                    >
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
