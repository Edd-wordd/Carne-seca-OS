'use client';

import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, ChevronUp, ChevronDown, Printer, Pencil, MoreHorizontal, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

export const FULFILLMENT_OPTIONS = [
    { value: 'unfulfilled', label: 'Unfulfilled' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
];

export const ORDER_SOURCES = [
    { value: 'website', label: 'Website' },
    { value: 'pos', label: 'POS' },
];

export function formatCurrency(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
}

export function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function formatAddress(addr) {
    if (!addr || typeof addr !== 'object') return '—';
    const line2 = addr.line2?.trim();
    const cityLine = [addr.city, addr.state].filter(Boolean).join(', ');
    const cityZip = [cityLine, addr.zip].filter(Boolean).join(' ');
    const parts = [addr.line1?.trim(), line2 || null, cityZip.trim() || null, addr.country?.trim()].filter(Boolean);
    return parts.length ? parts.join('\n') : '—';
}

export const FULFILLMENT_TO_STATUS = {
    unfulfilled: 'pending',
    shipped: 'shipped',
    delivered: 'delivered',
};

/** Legacy rows may still have fulfillment/status "processing"; treat as unfulfilled / pending for UI. */
export function normalizeFulfillmentValue(f) {
    return f === 'processing' ? 'unfulfilled' : (f ?? 'unfulfilled');
}

export function orderStatusForFilter(o) {
    if (o.status === 'processing') return 'pending';
    return o.status;
}

/** UI-only placeholder until orders store a real Stripe payment intent id (e.g. pi_…). */
function placeholderStripePaymentDashboardUrl(orderId) {
    const suffix = String(orderId).replace(/[^a-zA-Z0-9]/g, '_');
    return `https://dashboard.stripe.com/test/payments/pi_PLACEHOLDER_${suffix}`;
}

const STATUS_STYLES = {
    pending: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    shipped: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400',
    delivered: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    refunded: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
};

function lineItemsQuantitySum(lineItems) {
    return (lineItems ?? []).reduce((s, li) => s + (li.quantity ?? 0), 0);
}

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

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function fulfillmentLabel(f) {
    const v = normalizeFulfillmentValue(f);
    return FULFILLMENT_OPTIONS.find((o) => o.value === v)?.label ?? v ?? '—';
}


export function OrdersTable({
    orders,
    allOrders = orders,
    hasActiveSearch,
    pagination,
    dateSortOrder,
    onDateSortToggle,
    searchQuery,
    setSearchQuery,
    onUpdateOrder,
}) {
    const [packingSlipOrder, setPackingSlipOrder] = React.useState(null);
    const [detailOrderId, setDetailOrderId] = React.useState(null);
    const [editOpen, setEditOpen] = React.useState(false);
    const [editingOrder, setEditingOrder] = React.useState(null);
    const [editForm, setEditForm] = React.useState({
        customer: '',
        email: '',
        fulfillment: 'unfulfilled',
        tracking: '',
        source: 'website',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        country: '',
    });

    const detailOrder = React.useMemo(
        () => (detailOrderId ? (allOrders.find((o) => o.id === detailOrderId) ?? null) : null),
        [detailOrderId, allOrders],
    );

    React.useEffect(() => {
        if (detailOrderId && !detailOrder) setDetailOrderId(null);
    }, [detailOrderId, detailOrder]);

    const detailLineSubtotal = detailOrder?.lineItems?.length ? lineItemsSubtotalCents(detailOrder.lineItems) : null;
    const detailDiscountCents = detailOrder ? orderDiscountCents(detailOrder) : 0;
    const detailPromoCode = detailOrder ? orderPromoCode(detailOrder) : '';
    const detailExpectedAfterDiscount = detailLineSubtotal != null ? detailLineSubtotal - detailDiscountCents : null;

    const getStatus = (order) => {
        if (order.refunded) return 'refunded';
        if (order.status === 'processing') return 'pending';
        return order.status;
    };

    const openEditModal = (order) => {
        const a = order.address;
        setEditingOrder(order);
        setEditForm({
            customer: order.customer ?? '',
            email: order.email ?? '',
            fulfillment: normalizeFulfillmentValue(order.fulfillment),
            tracking: order.tracking ?? '',
            source: order.source ?? 'website',
            addressLine1: a?.line1 ?? '',
            addressLine2: a?.line2 ?? '',
            city: a?.city ?? '',
            state: a?.state ?? '',
            zip: a?.zip ?? '',
            country: a?.country ?? '',
        });
        setEditOpen(true);
    };

    const handleRowBackgroundClick = (order, e) => {
        if (e.target.closest('button,[role="menuitem"]')) return;
        setDetailOrderId(order.id);
    };

    const handleSaveEdit = () => {
        if (!editingOrder) return;
        const id = editingOrder.id;
        const itemCount = editingOrder.lineItems?.length
            ? lineItemsQuantitySum(editingOrder.lineItems)
            : Math.max(1, editingOrder.items ?? 1);
        onUpdateOrder(id, {
            customer: (editForm.customer ?? '').trim() || 'Unknown',
            email: (editForm.email ?? '').trim(),
            items: itemCount,
            total: editingOrder.total ?? 0,
            fulfillment: editForm.fulfillment ?? 'unfulfilled',
            tracking: (editForm.tracking ?? '').trim(),
            source: editForm.source === 'pos' ? 'pos' : 'website',
            address: {
                line1: (editForm.addressLine1 ?? '').trim(),
                line2: (editForm.addressLine2 ?? '').trim(),
                city: (editForm.city ?? '').trim(),
                state: (editForm.state ?? '').trim(),
                zip: (editForm.zip ?? '').trim(),
                country: (editForm.country ?? '').trim(),
            },
            status: editingOrder.refunded
                ? editingOrder.status
                : (FULFILLMENT_TO_STATUS[editForm.fulfillment ?? 'unfulfilled'] ?? 'pending'),
        });
        setEditOpen(false);
        setEditingOrder(null);
    };

    const handleQuickFulfillmentUpdate = (order, nextFulfillment) => {
        if (!order || order.refunded) return;
        onUpdateOrder(order.id, {
            fulfillment: nextFulfillment,
            status: FULFILLMENT_TO_STATUS[nextFulfillment] ?? order.status,
        });
    };

    const handlePrintPackingSlip = (order) => {
        if (!order) return;
        const popup = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
        if (!popup) return;

        const lines = order.lineItems?.length
            ? order.lineItems
            : [{ name: `${order.items ?? 0} item(s)`, quantity: order.items ?? 0 }];
        const lineRows = lines
            .map(
                (li) => `
                    <tr>
                        <td>${escapeHtml(li.name ?? 'Item')}</td>
                        <td style="text-align:right;">${escapeHtml(li.quantity ?? 0)}</td>
                    </tr>`,
            )
            .join('');
        const addrHtml = escapeHtml(formatAddress(order.address)).replaceAll('\n', '<br />');
        const logo = 'Carne Seca';
        const html = `
            <!doctype html>
            <html>
                <head>
                    <meta charset="utf-8" />
                    <title>Packing Slip ${escapeHtml(order.id)}</title>
                    <style>
                        body { font-family: Inter, Arial, sans-serif; padding: 24px; color: #111; }
                        .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #111; padding-bottom:12px; margin-bottom:16px; }
                        .logo { font-size: 24px; font-weight: 700; letter-spacing: .4px; }
                        .meta { font-size: 12px; line-height:1.5; text-align:right; }
                        .section { margin-top: 14px; }
                        .label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #555; margin-bottom: 6px; }
                        .value { font-size: 14px; line-height: 1.45; }
                        table { width:100%; border-collapse:collapse; margin-top:8px; }
                        th, td { border-bottom:1px solid #ddd; padding:8px 6px; font-size:13px; }
                        th { text-align:left; color:#444; font-size:11px; text-transform:uppercase; letter-spacing:.06em; }
                        .foot { margin-top: 18px; font-size:11px; color:#666; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">${escapeHtml(logo)}</div>
                        <div class="meta">
                            <div><strong>Order ID:</strong> ${escapeHtml(order.id)}</div>
                            <div><strong>Date:</strong> ${escapeHtml(formatDateTime(order.date))}</div>
                        </div>
                    </div>
                    <div class="section">
                        <div class="label">Customer</div>
                        <div class="value">${escapeHtml(order.customer || '—')}</div>
                    </div>
                    <div class="section">
                        <div class="label">Shipping Address</div>
                        <div class="value">${addrHtml}</div>
                    </div>
                    <div class="section">
                        <div class="label">Items to Pack</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th style="text-align:right;">Qty</th>
                                </tr>
                            </thead>
                            <tbody>${lineRows}</tbody>
                        </table>
                    </div>
                    <div class="foot">Packing slip generated from Admin Orders</div>
                </body>
            </html>
        `;

        popup.document.open();
        popup.document.write(html);
        popup.document.close();
        popup.focus();
        popup.print();
    };

    return (
        <>
            <div className="overflow-hidden rounded border border-zinc-800">
                <div className="border-b border-zinc-800 bg-zinc-900/80 px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-zinc-200 text-sm font-medium">Orders</h2>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                            <Input
                                placeholder="Search orders…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-7 w-[160px] border-zinc-700 bg-zinc-950 pl-8 text-[10px] text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="border-zinc-700/80 hover:bg-transparent">
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Order ID</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Customer</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Email</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Source</TableHead>
                            <TableHead
                                className="text-zinc-400 h-8 px-3 text-[10px] cursor-pointer select-none hover:text-zinc-300 transition-colors"
                                onClick={onDateSortToggle}
                            >
                                <span className="flex w-full items-center justify-between">
                                    Date
                                    {dateSortOrder === 'asc' ? (
                                        <ChevronUp className="size-3.5 shrink-0" />
                                    ) : (
                                        <ChevronDown className="size-3.5 shrink-0" />
                                    )}
                                </span>
                            </TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Items</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Status</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Fulfillment</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Tracking</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px] text-right">Total</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-2 text-[10px] text-right w-14">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow className="border-zinc-700/80">
                                <TableCell colSpan={11} className="text-zinc-400 py-4 text-center text-[11px]">
                                    {hasActiveSearch ? 'No orders match your search or filters' : 'No orders'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow
                                    key={order.id}
                                    tabIndex={0}
                                    title="View order details"
                                    onClick={(e) => handleRowBackgroundClick(order, e)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setDetailOrderId(order.id);
                                        }
                                    }}
                                    className="group cursor-pointer border-zinc-700/80 transition-colors hover:!bg-zinc-700/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-500"
                                >
                                    <TableCell className="text-zinc-200 px-3 py-1.5 font-mono text-[11px] font-medium group-hover:text-zinc-100">
                                        {order.id}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] group-hover:text-zinc-300">
                                        {order.customer}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] max-w-[180px] truncate group-hover:text-zinc-300">
                                        {order.email?.trim() ? order.email : '—'}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] group-hover:text-zinc-300">
                                        {ORDER_SOURCES.find((s) => s.value === (order.source ?? 'website'))?.label ??
                                            'Website'}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] tabular-nums group-hover:text-zinc-300">
                                        {formatDateTime(order.date)}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-center text-[11px] tabular-nums group-hover:text-zinc-300">
                                        {order.lineItems?.length
                                            ? lineItemsQuantitySum(order.lineItems)
                                            : (order.items ?? 0)}
                                    </TableCell>
                                    <TableCell className="px-3 py-1.5">
                                        <span
                                            className={cn(
                                                'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize',
                                                STATUS_STYLES[getStatus(order)] || STATUS_STYLES.pending,
                                            )}
                                        >
                                            {getStatus(order)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] capitalize group-hover:text-zinc-300">
                                        {fulfillmentLabel(order.fulfillment)}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] font-mono max-w-[140px] truncate group-hover:text-zinc-300">
                                        {order.tracking?.trim() ? order.tracking : '—'}
                                    </TableCell>
                                    <TableCell className="text-zinc-100 px-3 py-1.5 text-right text-[11px] font-medium tabular-nums group-hover:text-white">
                                        {formatCurrency(order.total)}
                                    </TableCell>
                                    <TableCell className="px-2 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/50"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal className="size-4" />
                                                    <span className="sr-only">Actions</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="min-w-[10rem] border-zinc-800 bg-zinc-900 text-zinc-100"
                                            >
                                                <DropdownMenuItem
                                                    className="cursor-pointer text-xs focus:bg-zinc-800 focus:text-zinc-100"
                                                    onClick={() => openEditModal(order)}
                                                >
                                                    <Pencil className="mr-2 size-3.5" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="cursor-pointer text-xs focus:bg-zinc-800 focus:text-zinc-100"
                                                    onClick={() => setPackingSlipOrder(order)}
                                                    disabled={order.refunded}
                                                >
                                                    <Printer className="mr-2 size-3.5" />
                                                    Print packing slip
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="cursor-pointer text-xs focus:bg-zinc-800 focus:text-zinc-100"
                                                    asChild
                                                >
                                                    <a
                                                        href={placeholderStripePaymentDashboardUrl(order.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <ExternalLink className="mr-2 size-3.5" />
                                                        View in Stripe
                                                    </a>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {pagination}
            </div>

            <Dialog open={!!packingSlipOrder} onOpenChange={(o) => !o && setPackingSlipOrder(null)}>
                <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto border-zinc-800 bg-zinc-900 sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Print Packing Slip</DialogTitle>
                        <DialogDescription>
                            {packingSlipOrder
                                ? `Generate packing slip for ${packingSlipOrder.id} — ${packingSlipOrder.customer}`
                                : ''}
                        </DialogDescription>
                    </DialogHeader>
                    {packingSlipOrder ? (
                        <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-sm">
                            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
                                <p className="text-zinc-100 text-lg font-semibold">Carne Seca</p>
                                <div className="text-right text-xs text-zinc-400">
                                    <p>
                                        Order ID: <span className="font-mono text-zinc-300">{packingSlipOrder.id}</span>
                                    </p>
                                    <p>{formatDateTime(packingSlipOrder.date)}</p>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1">
                                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Customer</p>
                                <p className="text-zinc-100">{packingSlipOrder.customer || '—'}</p>
                            </div>
                            <div className="mt-3 space-y-1">
                                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Shipping address</p>
                                <p className="text-zinc-300 text-xs whitespace-pre-line">
                                    {formatAddress(packingSlipOrder.address)}
                                </p>
                            </div>
                            <div className="mt-4">
                                <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">
                                    Items to pack
                                </p>
                                <div className="rounded border border-zinc-800 overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">
                                                    Item
                                                </TableHead>
                                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500 text-right w-16">
                                                    Qty
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(packingSlipOrder.lineItems?.length
                                                ? packingSlipOrder.lineItems
                                                : [
                                                      {
                                                          name: `${packingSlipOrder.items ?? 0} item(s)`,
                                                          quantity: packingSlipOrder.items ?? 0,
                                                      },
                                                  ]
                                            ).map((li, idx) => (
                                                <TableRow
                                                    key={`${packingSlipOrder.id}-pack-li-${idx}`}
                                                    className="border-zinc-800"
                                                >
                                                    <TableCell className="px-3 py-2 text-xs text-zinc-200">
                                                        {li.name}
                                                    </TableCell>
                                                    <TableCell className="px-3 py-2 text-xs text-zinc-300 text-right tabular-nums">
                                                        {li.quantity ?? 0}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    ) : null}
                    <DialogFooter className="gap-4">
                        <Button
                            variant="outline"
                            onClick={() => setPackingSlipOrder(null)}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handlePrintPackingSlip(packingSlipOrder)}
                            className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                        >
                            <Printer className="mr-2 size-3.5" />
                            Print
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!detailOrder} onOpenChange={(o) => !o && setDetailOrderId(null)}>
                <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto border-zinc-800 bg-zinc-900 sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-100">{detailOrder?.id ?? 'Order'}</DialogTitle>
                        <DialogDescription className="text-zinc-400 text-xs">
                            {detailOrder
                                ? `${formatDateTime(detailOrder.date)} · ${ORDER_SOURCES.find((s) => s.value === (detailOrder.source ?? 'website'))?.label ?? 'Website'}`
                                : ''}
                        </DialogDescription>
                    </DialogHeader>
                    {detailOrder && (
                        <div className="space-y-5 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className={cn(
                                        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize',
                                        STATUS_STYLES[getStatus(detailOrder)] || STATUS_STYLES.pending,
                                    )}
                                >
                                    {getStatus(detailOrder)}
                                </span>
                                <span className="text-zinc-500 text-[11px]">
                                    Fulfillment:{' '}
                                    <span className="text-zinc-300">{fulfillmentLabel(detailOrder.fulfillment)}</span>
                                </span>
                                {detailOrder.tracking?.trim() ? (
                                    <span className="text-zinc-500 text-[11px] font-mono">
                                        Tracking: <span className="text-zinc-300">{detailOrder.tracking}</span>
                                    </span>
                                ) : null}
                                {!detailOrder.refunded ? (
                                    <>
                                        {detailOrder.fulfillment !== 'shipped' &&
                                        detailOrder.fulfillment !== 'delivered' ? (
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="h-6 px-2 text-[10px] bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                                                onClick={() => handleQuickFulfillmentUpdate(detailOrder, 'shipped')}
                                            >
                                                Mark shipped
                                            </Button>
                                        ) : null}
                                        {detailOrder.fulfillment === 'shipped' ? (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="h-6 px-2 text-[10px] border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                                onClick={() => handleQuickFulfillmentUpdate(detailOrder, 'delivered')}
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
                                <p className="text-zinc-100 font-medium">{detailOrder.customer}</p>
                                <p className="text-zinc-400 text-xs mt-0.5">{detailOrder.email || '—'}</p>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-2">
                                    Shipping address
                                </h3>
                                <p className="text-zinc-300 text-xs whitespace-pre-line leading-relaxed">
                                    {formatAddress(detailOrder.address)}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-2">
                                    Line items
                                </h3>
                                {detailOrder.lineItems?.length ? (
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
                                                {detailOrder.lineItems.map((li, idx) => {
                                                    const lineTotal = (li.quantity ?? 0) * (li.unitPriceCents ?? 0);
                                                    return (
                                                        <TableRow
                                                            key={`${detailOrder.id}-li-${idx}`}
                                                            className="border-zinc-800"
                                                        >
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
                                        No line breakdown on file. Item count (summary): {detailOrder.items ?? 0}
                                    </p>
                                )}
                            </div>

                            <div className="border-t border-zinc-800 pt-4 space-y-1.5">
                                {detailOrder.lineItems?.length ? (
                                    <div className="flex justify-between text-xs text-zinc-500">
                                        <span>Subtotal (lines)</span>
                                        <span className="tabular-nums text-zinc-300">
                                            {formatCurrency(lineItemsSubtotalCents(detailOrder.lineItems))}
                                        </span>
                                    </div>
                                ) : null}
                                {detailDiscountCents > 0 ? (
                                    <div className="flex justify-between text-xs text-zinc-500">
                                        <span>Discount{detailPromoCode ? ` (${detailPromoCode})` : ''}</span>
                                        <span className="tabular-nums text-emerald-400">
                                            -{formatCurrency(detailDiscountCents)}
                                        </span>
                                    </div>
                                ) : null}
                                <div className="flex justify-between items-baseline">
                                    <span className="text-zinc-400 text-sm font-medium">Order total</span>
                                    <span className="text-lg font-semibold text-zinc-100 tabular-nums">
                                        {formatCurrency(detailOrder.total)}
                                    </span>
                                </div>
                                {detailExpectedAfterDiscount != null &&
                                detailExpectedAfterDiscount !== detailOrder.total ? (
                                    <p className="text-[10px] text-amber-500/90">
                                        Line subtotal differs from order total (taxes, shipping, or manual adjustments
                                        may apply).
                                    </p>
                                ) : null}
                            </div>

                            <DialogFooter className="gap-2 sm:justify-between sm:space-x-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDetailOrderId(null)}
                                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                >
                                    Close
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        openEditModal(detailOrder);
                                        setDetailOrderId(null);
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

            <Dialog
                open={editOpen}
                onOpenChange={(open) => {
                    setEditOpen(open);
                    if (!open) setEditingOrder(null);
                }}
            >
                <DialogContent className="max-h-[min(90vh,640px)] overflow-y-auto border-zinc-800 bg-zinc-900 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit order</DialogTitle>
                        <DialogDescription>{editingOrder ? `Update ${editingOrder.id}` : ''}</DialogDescription>
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
                            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                                Shipping address
                            </p>
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
                                    {editingOrder?.lineItems?.length
                                        ? lineItemsQuantitySum(editingOrder.lineItems)
                                        : (editingOrder?.items ?? 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500">Total</p>
                                <p className="mt-0.5 text-sm font-medium tabular-nums text-zinc-200">
                                    {formatCurrency(editingOrder?.total ?? 0)}
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
                            onClick={() => {
                                setEditOpen(false);
                                setEditingOrder(null);
                            }}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSaveEdit}
                            className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                        >
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
