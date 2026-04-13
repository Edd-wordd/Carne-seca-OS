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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import {
    ORDER_SOURCES,
    FULFILLMENT_OPTIONS,
    formatCurrency,
    formatDateTime,
    formatAddress,
    normalizeFulfillmentValue,
} from './OrdersTable';

const STATUS_STYLES = {
    pending: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    shipped: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400',
    delivered: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    refunded: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
};

function lineItemsSubtotalCents(lineItems) {
    return (lineItems ?? []).reduce((s, li) => s + (li.quantity ?? 0) * (li.unitPriceCents ?? 0), 0);
}

function orderDiscountCents(order) {
    const explicit = Math.max(0, Math.round(Number(order?.discountCents) || 0));
    if (explicit > 0) return explicit;
    if (!order?.lineItems?.length) return 0;
    const inferred = lineItemsSubtotalCents(order.lineItems) - (Math.round(Number(order.total) || 0) || 0);
    return inferred > 0 ? inferred : 0;
}

function orderPromoCode(order) {
    return String(order?.promoCode ?? order?.couponCode ?? '').trim();
}

function fulfillmentLabel(f) {
    const v = normalizeFulfillmentValue(f);
    return FULFILLMENT_OPTIONS.find((o) => o.value === v)?.label ?? v ?? '—';
}

function getStatus(order) {
    if (order.refunded) return 'refunded';
    if (order.status === 'processing') return 'pending';
    return order.status;
}

export function OrderDetailDialog({ order, onClose, onEdit, onQuickFulfillmentUpdate }) {
    const detailLineSubtotal = order?.lineItems?.length ? lineItemsSubtotalCents(order.lineItems) : null;
    const detailDiscountCents = order ? orderDiscountCents(order) : 0;
    const detailPromo = order ? orderPromoCode(order) : '';
    const detailExpectedAfterDiscount = detailLineSubtotal != null ? detailLineSubtotal - detailDiscountCents : null;

    return (
        <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto border-zinc-800 bg-zinc-900 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">{order?.id ?? 'Order'}</DialogTitle>
                    <DialogDescription className="text-zinc-400 text-xs">
                        {order
                            ? `${formatDateTime(order.date)} · ${ORDER_SOURCES.find((s) => s.value === (order.source ?? 'website'))?.label ?? 'Website'}`
                            : ''}
                    </DialogDescription>
                </DialogHeader>
                {order && (
                    <div className="space-y-5 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={cn(
                                    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize',
                                    STATUS_STYLES[getStatus(order)] || STATUS_STYLES.pending,
                                )}
                            >
                                {getStatus(order)}
                            </span>
                            <span className="text-zinc-500 text-[11px]">
                                Fulfillment:{' '}
                                <span className="text-zinc-300">{fulfillmentLabel(order.fulfillment)}</span>
                            </span>
                            {order.tracking?.trim() ? (
                                <span className="text-zinc-500 text-[11px] font-mono">
                                    Tracking: <span className="text-zinc-300">{order.tracking}</span>
                                </span>
                            ) : null}
                            {!order.refunded ? (
                                <>
                                    {order.fulfillment !== 'shipped' && order.fulfillment !== 'delivered' ? (
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="h-6 px-2 text-[10px] bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                                            onClick={() => onQuickFulfillmentUpdate(order, 'shipped')}
                                        >
                                            Mark shipped
                                        </Button>
                                    ) : null}
                                    {order.fulfillment === 'shipped' ? (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="h-6 px-2 text-[10px] border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                            onClick={() => onQuickFulfillmentUpdate(order, 'delivered')}
                                        >
                                            Mark delivered
                                        </Button>
                                    ) : null}
                                </>
                            ) : null}
                        </div>

                        <div>
                            <h3 className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-2">
                                Customer
                            </h3>
                            <p className="text-zinc-100 font-medium">{order.customer}</p>
                            <p className="text-zinc-400 text-xs mt-0.5">{order.email || '—'}</p>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-2">
                                Shipping address
                            </h3>
                            <p className="text-zinc-300 text-xs whitespace-pre-line leading-relaxed">
                                {formatAddress(order.address)}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-2">
                                Line items
                            </h3>
                            {order.lineItems?.length ? (
                                <div className="rounded-md border border-zinc-800 overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                                <TableHead className="text-zinc-500 h-8 px-3 text-[10px]">
                                                    Product
                                                </TableHead>
                                                <TableHead className="text-zinc-500 h-8 px-2 text-[10px] text-center w-14">
                                                    Qty
                                                </TableHead>
                                                <TableHead className="text-zinc-500 h-8 px-2 text-[10px] text-right w-24">
                                                    Price
                                                </TableHead>
                                                <TableHead className="text-zinc-500 h-8 px-3 text-[10px] text-right w-28">
                                                    Line total
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {order.lineItems.map((li, idx) => {
                                                const lineTotal = (li.quantity ?? 0) * (li.unitPriceCents ?? 0);
                                                return (
                                                    <TableRow key={`${order.id}-li-${idx}`} className="border-zinc-800">
                                                        <TableCell className="text-zinc-200 px-3 py-2 text-xs">
                                                            {li.name}
                                                        </TableCell>
                                                        <TableCell className="text-zinc-400 px-2 py-2 text-center text-xs tabular-nums">
                                                            {li.quantity ?? 0}
                                                        </TableCell>
                                                        <TableCell className="text-zinc-400 px-2 py-2 text-right text-xs tabular-nums">
                                                            {formatCurrency(li.unitPriceCents ?? 0)}
                                                        </TableCell>
                                                        <TableCell className="text-zinc-100 px-3 py-2 text-right text-xs font-medium tabular-nums">
                                                            {formatCurrency(lineTotal)}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <p className="text-zinc-500 text-xs">
                                    No line breakdown on file. Item count (summary): {order.items ?? 0}
                                </p>
                            )}
                        </div>

                        <div className="border-t border-zinc-800 pt-4 space-y-1.5">
                            {order.lineItems?.length ? (
                                <div className="flex justify-between text-xs text-zinc-500">
                                    <span>Subtotal (lines)</span>
                                    <span className="tabular-nums text-zinc-300">
                                        {formatCurrency(lineItemsSubtotalCents(order.lineItems))}
                                    </span>
                                </div>
                            ) : null}
                            {detailDiscountCents > 0 ? (
                                <div className="flex justify-between text-xs text-zinc-500">
                                    <span>Discount{detailPromo ? ` (${detailPromo})` : ''}</span>
                                    <span className="tabular-nums text-emerald-400">
                                        -{formatCurrency(detailDiscountCents)}
                                    </span>
                                </div>
                            ) : null}
                            <div className="flex justify-between items-baseline">
                                <span className="text-zinc-400 text-sm font-medium">Order total</span>
                                <span className="text-lg font-semibold text-zinc-100 tabular-nums">
                                    {formatCurrency(order.total)}
                                </span>
                            </div>
                            {detailExpectedAfterDiscount != null && detailExpectedAfterDiscount !== order.total ? (
                                <p className="text-[10px] text-amber-500/90">
                                    Line subtotal differs from order total (taxes, shipping, or manual adjustments may
                                    apply).
                                </p>
                            ) : null}
                        </div>

                        <DialogFooter className="gap-2 sm:justify-between sm:space-x-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            >
                                Close
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    onEdit(order);
                                    onClose();
                                }}
                                className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                            >
                                <Pencil className="mr-2 size-3.5" />
                                Edit order
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
