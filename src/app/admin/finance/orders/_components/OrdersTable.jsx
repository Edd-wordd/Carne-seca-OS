'use client';

import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, ChevronUp, ChevronDown, Printer, Pencil, MoreHorizontal, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { toast } from 'sonner';
import { updateOrder } from '@/app/actions/orders/updateOrder';
import { OrderPackingSlipDialog } from './OrderPackingSlipDialog';
import { OrderDetailDialog } from './OrderDetailDialog';
import { OrderEditDialog } from './OrderEditDialog';

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
    const s = o.status;
    if (s === 'processing') return 'pending';
    if (s === 'paid') return 'pending';
    return s;
}

function stripePaymentDashboardUrl(order) {
    const isProduction = process.env.NODE_ENV === 'production';
    const base = isProduction
        ? 'https://dashboard.stripe.com/payments'
        : 'https://dashboard.stripe.com/test/payments';
    return `${base}/${order.stripe_payment_intent_id}`;
}

const STATUS_STYLES = {
    pending: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    shipped: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400',
    delivered: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    refunded: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
};

function orderItemsQuantitySum(order_items) {
    return (order_items ?? []).reduce((s, li) => s + (li.quantity ?? 0), 0);
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
    const [isEditSavePending, setIsEditSavePending] = React.useState(false);
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

    const getStatus = (order) => {
        if (order.refunded) return 'refunded';
        if (order.status === 'processing' || order.status === 'paid') return 'pending';
        return order.status;
    };

    const openEditModal = (order) => {
        const a = order.shipping_address;
        setEditingOrder(order);
        setEditForm({
            customer: order.customer_name ?? '',
            email: order.customer_email ?? '',
            fulfillment: normalizeFulfillmentValue(order.fulfillment_status),
            tracking: order.tracking_number ?? '',
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

    const handleSaveEdit = async () => {
        if (!editingOrder || isEditSavePending) return;
        const id = editingOrder.id;
        const itemCount = editingOrder.order_items?.length
            ? orderItemsQuantitySum(editingOrder.order_items)
            : Math.max(1, editingOrder.items ?? 1);
        const customer_name = (editForm.customer ?? '').trim() || 'Unknown';
        const customer_email = (editForm.email ?? '').trim();
        const source = editForm.source === 'pos' ? 'pos' : 'website';
        const fulfillment_status = editForm.fulfillment ?? 'unfulfilled';
        const tracking_number = (editForm.tracking ?? '').trim();
        const shipping_address = {
            line1: (editForm.addressLine1 ?? '').trim(),
            line2: (editForm.addressLine2 ?? '').trim(),
            city: (editForm.city ?? '').trim(),
            state: (editForm.state ?? '').trim(),
            zip: (editForm.zip ?? '').trim(),
            country: (editForm.country ?? '').trim(),
        };

        setIsEditSavePending(true);
        try {
            const result = await updateOrder({
                orderId: id,
                customer: customer_name,
                email: customer_email,
                source,
                address: shipping_address,
                fulfillment: fulfillment_status,
                tracking: tracking_number,
            });

            if (!result?.success) {
                toast.error(result?.message ?? 'Failed to update order');
                return;
            }

            onUpdateOrder(id, {
                customer_name,
                customer_email,
                items: itemCount,
                amount_total: editingOrder.amount_total ?? 0,
                fulfillment_status,
                tracking_number,
                source,
                shipping_address,
                status: editingOrder.refunded
                    ? editingOrder.status
                    : (FULFILLMENT_TO_STATUS[fulfillment_status] ?? 'pending'),
            });
            toast.success('Order updated');
            setEditOpen(false);
            setEditingOrder(null);
        } finally {
            setIsEditSavePending(false);
        }
    };

    const handleQuickFulfillmentUpdate = async (order, nextFulfillment) => {
        if (!order || order.refunded) return;
        const customer_name = (order.customer_name ?? '').trim() || 'Unknown';
        const customer_email = (order.customer_email ?? '').trim();
        const source = order.source === 'pos' ? 'pos' : 'website';
        const a = order.shipping_address ?? {};
        const shipping_address = {
            line1: String(a.line1 ?? '').trim(),
            line2: String(a.line2 ?? '').trim(),
            city: String(a.city ?? '').trim(),
            state: String(a.state ?? '').trim(),
            zip: String(a.zip ?? '').trim(),
            country: String(a.country ?? '').trim(),
        };
        const tracking_number = (order.tracking_number ?? '').trim();

        const result = await updateOrder({
            orderId: order.id,
            customer: customer_name,
            email: customer_email,
            source,
            address: shipping_address,
            fulfillment: nextFulfillment,
            tracking: tracking_number,
        });

        if (!result?.success) {
            toast.error(result?.message ?? 'Failed to update fulfillment');
            return;
        }

        onUpdateOrder(order.id, {
            fulfillment_status: nextFulfillment,
            status: FULFILLMENT_TO_STATUS[nextFulfillment] ?? order.status,
        });
        toast.success('Fulfillment updated');
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
                                        {order.order_number != null && order.order_number !== ''
                                            ? `ORD-${order.order_number}`
                                            : String(order.id).slice(0, 8)}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] group-hover:text-zinc-300">
                                        {order.customer_name}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] max-w-[180px] truncate group-hover:text-zinc-300">
                                        {order.customer_email?.trim() ? order.customer_email : '—'}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] group-hover:text-zinc-300">
                                        {ORDER_SOURCES.find((s) => s.value === (order.source ?? 'website'))?.label ??
                                            'Website'}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] tabular-nums group-hover:text-zinc-300">
                                        {formatDateTime(order.created_at)}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-center text-[11px] tabular-nums group-hover:text-zinc-300">
                                        {order.order_items?.length
                                            ? orderItemsQuantitySum(order.order_items)
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
                                        {fulfillmentLabel(order.fulfillment_status)}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] font-mono max-w-[140px] truncate group-hover:text-zinc-300">
                                        {order.tracking_number?.trim() ? order.tracking_number : '—'}
                                    </TableCell>
                                    <TableCell className="text-zinc-100 px-3 py-1.5 text-right text-[11px] font-medium tabular-nums group-hover:text-white">
                                        {formatCurrency(order.amount_total)}
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
                                                {order.stripe_payment_intent_id != null && (
                                                    <DropdownMenuItem
                                                        className="cursor-pointer text-xs focus:bg-zinc-800 focus:text-zinc-100"
                                                        asChild
                                                    >
                                                        <a
                                                            href={stripePaymentDashboardUrl(order)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <ExternalLink className="mr-2 size-3.5" />
                                                            View in Stripe
                                                        </a>
                                                    </DropdownMenuItem>
                                                )}
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

            <OrderPackingSlipDialog order={packingSlipOrder} onClose={() => setPackingSlipOrder(null)} />
            <OrderDetailDialog
                order={detailOrder}
                onClose={() => setDetailOrderId(null)}
                onEdit={openEditModal}
                onQuickFulfillmentUpdate={handleQuickFulfillmentUpdate}
            />
            <OrderEditDialog
                open={editOpen}
                editingOrder={editingOrder}
                editForm={editForm}
                setEditForm={setEditForm}
                savePending={isEditSavePending}
                onOpenChange={(open) => {
                    setEditOpen(open);
                    if (!open) {
                        setEditingOrder(null);
                        setIsEditSavePending(false);
                    }
                }}
                onSave={handleSaveEdit}
                onCancel={() => {
                    if (isEditSavePending) return;
                    setEditOpen(false);
                    setEditingOrder(null);
                }}
            />
        </>
    );
}
