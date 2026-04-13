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
import { Plus, Trash2 } from 'lucide-react';
import { FULFILLMENT_OPTIONS, ORDER_SOURCES, formatCurrency } from './OrdersTable';

export function CreateOrderDialog({
    open,
    onOpenChange,
    newOrderForm,
    setNewOrderForm,
    createOrderLines,
    catalogLoading,
    catalogError,
    orderableCatalog,
    createPreview,
    updateCreateLine,
    addCreateOrderLine,
    removeCreateOrderLine,
    formatProductLineName,
    isCreatePending = false,
    onSubmit,
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto border-zinc-800 bg-zinc-900 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create Order</DialogTitle>
                    <DialogDescription>Add a manual order.</DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                    className="space-y-5"
                >
                    <div className="space-y-1.5">
                        <Label htmlFor="order-customer" className="text-xs text-zinc-400">
                            Customer
                        </Label>
                        <Input
                            id="order-customer"
                            placeholder="Name"
                            value={newOrderForm.customer ?? ''}
                            onChange={(e) => setNewOrderForm((f) => ({ ...f, customer: e.target.value }))}
                            className="h-9 border-zinc-700 bg-zinc-950/80"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="order-email" className="text-xs text-zinc-400">
                            Email
                        </Label>
                        <Input
                            id="order-email"
                            type="email"
                            autoComplete="email"
                            placeholder="customer@example.com"
                            value={newOrderForm.email ?? ''}
                            onChange={(e) => setNewOrderForm((f) => ({ ...f, email: e.target.value }))}
                            className="h-9 border-zinc-700 bg-zinc-950/80"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-zinc-400">Source</Label>
                        <Select
                            value={newOrderForm.source ?? 'website'}
                            onValueChange={(v) => setNewOrderForm((f) => ({ ...f, source: v }))}
                        >
                            <SelectTrigger className="h-9 border-zinc-700 bg-zinc-950/80">
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
                        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                            Shipping address
                        </p>
                        <div className="space-y-1.5">
                            <Label htmlFor="new-addr-line1" className="text-xs text-zinc-400">
                                Address line 1
                            </Label>
                            <Input
                                id="new-addr-line1"
                                value={newOrderForm.addressLine1 ?? ''}
                                onChange={(e) => setNewOrderForm((f) => ({ ...f, addressLine1: e.target.value }))}
                                className="h-9 border-zinc-700 bg-zinc-950/80"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="new-addr-line2" className="text-xs text-zinc-400">
                                Address line 2
                            </Label>
                            <Input
                                id="new-addr-line2"
                                value={newOrderForm.addressLine2 ?? ''}
                                onChange={(e) => setNewOrderForm((f) => ({ ...f, addressLine2: e.target.value }))}
                                className="h-9 border-zinc-700 bg-zinc-950/80"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="new-addr-city" className="text-xs text-zinc-400">
                                    City
                                </Label>
                                <Input
                                    id="new-addr-city"
                                    value={newOrderForm.city ?? ''}
                                    onChange={(e) => setNewOrderForm((f) => ({ ...f, city: e.target.value }))}
                                    className="h-9 border-zinc-700 bg-zinc-950/80"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="new-addr-state" className="text-xs text-zinc-400">
                                    State
                                </Label>
                                <Input
                                    id="new-addr-state"
                                    value={newOrderForm.state ?? ''}
                                    onChange={(e) => setNewOrderForm((f) => ({ ...f, state: e.target.value }))}
                                    className="h-9 border-zinc-700 bg-zinc-950/80"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="new-addr-zip" className="text-xs text-zinc-400">
                                    ZIP
                                </Label>
                                <Input
                                    id="new-addr-zip"
                                    value={newOrderForm.zip ?? ''}
                                    onChange={(e) => setNewOrderForm((f) => ({ ...f, zip: e.target.value }))}
                                    className="h-9 border-zinc-700 bg-zinc-950/80"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="new-addr-country" className="text-xs text-zinc-400">
                                    Country
                                </Label>
                                <Input
                                    id="new-addr-country"
                                    value={newOrderForm.country ?? ''}
                                    onChange={(e) => setNewOrderForm((f) => ({ ...f, country: e.target.value }))}
                                    className="h-9 border-zinc-700 bg-zinc-950/80"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Line items</p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1 border-zinc-700 bg-zinc-900/80 px-2 text-[10px] text-zinc-300"
                                onClick={addCreateOrderLine}
                                disabled={catalogLoading || !!catalogError}
                            >
                                <Plus className="size-3" />
                                Add line
                            </Button>
                        </div>
                        {catalogLoading ? (
                            <p className="text-zinc-500 text-xs py-2">Loading catalog…</p>
                        ) : catalogError ? (
                            <p className="text-amber-400/90 text-xs py-2">{catalogError}</p>
                        ) : orderableCatalog.length === 0 ? (
                            <p className="text-zinc-500 text-xs py-2">
                                No active products in catalog. Add or activate products under Catalog first.
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {createOrderLines.map((line) => (
                                    <li
                                        key={line.key}
                                        className="flex flex-wrap items-end gap-2 rounded-md border border-zinc-800/80 bg-zinc-950/50 p-2"
                                    >
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <Label className="text-[10px] text-zinc-500">Product</Label>
                                            <Select
                                                value={line.productId ? String(line.productId) : '__none__'}
                                                onValueChange={(v) =>
                                                    updateCreateLine(line.key, {
                                                        productId: v === '__none__' ? '' : v,
                                                    })
                                                }
                                            >
                                                <SelectTrigger className="h-9 border-zinc-700 bg-zinc-950/80 text-left text-xs">
                                                    <SelectValue placeholder="Select product" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[min(280px,50vh)]">
                                                    <SelectItem value="__none__" className="text-xs text-zinc-500">
                                                        Select product
                                                    </SelectItem>
                                                    {orderableCatalog.map((p) => (
                                                        <SelectItem
                                                            key={p.id}
                                                            value={String(p.id)}
                                                            className="text-xs"
                                                        >
                                                            <span className="flex flex-col gap-0.5 text-left">
                                                                <span>{formatProductLineName(p)}</span>
                                                                <span className="text-zinc-500 font-mono text-[10px] tabular-nums">
                                                                    {formatCurrency(
                                                                        Math.round(Number(p.price_cents) || 0),
                                                                    )}
                                                                    {p.sku ? ` · ${p.sku}` : ''}
                                                                </span>
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-20 space-y-1">
                                            <Label htmlFor={`qty-${line.key}`} className="text-[10px] text-zinc-500">
                                                Qty
                                            </Label>
                                            <Input
                                                id={`qty-${line.key}`}
                                                type="number"
                                                min={1}
                                                value={line.quantity ?? 1}
                                                onChange={(e) =>
                                                    updateCreateLine(line.key, {
                                                        quantity: Math.max(1, parseInt(e.target.value, 10) || 1),
                                                    })
                                                }
                                                className="h-9 border-zinc-700 bg-zinc-950/80 text-xs tabular-nums"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 shrink-0 text-zinc-500 hover:text-red-400"
                                            onClick={() => removeCreateOrderLine(line.key)}
                                            aria-label="Remove line"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-zinc-800 pt-2">
                            <span className="text-zinc-500 text-xs">
                                {createPreview.unitCount > 0
                                    ? `${createPreview.unitCount} unit${createPreview.unitCount === 1 ? '' : 's'}`
                                    : 'No items yet'}
                            </span>
                            <span className="text-zinc-100 text-sm font-medium tabular-nums">
                                Total {formatCurrency(createPreview.totalCents)}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-zinc-400">Fulfillment</Label>
                        <Select
                            value={newOrderForm.fulfillment ?? 'unfulfilled'}
                            onValueChange={(v) => setNewOrderForm((f) => ({ ...f, fulfillment: v }))}
                        >
                            <SelectTrigger className="h-9 border-zinc-700 bg-zinc-950/80">
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
                    <DialogFooter className="gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                isCreatePending ||
                                catalogLoading ||
                                !!catalogError ||
                                !createPreview.hasValidLine ||
                                orderableCatalog.length === 0
                            }
                            className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 disabled:opacity-50"
                        >
                            {isCreatePending ? 'Creating…' : 'Create Order'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
