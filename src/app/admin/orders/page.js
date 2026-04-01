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
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Printer,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    ShoppingBag,
    Clock,
    DollarSign,
    RotateCcw,
    Download,
    Pencil,
    Plus,
    MoreHorizontal,
    Trash2,
    CircleOff,
} from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { getProducts } from '@/lib/supabase/queries/getProducts';

const FULFILLMENT_OPTIONS = [
    { value: 'unfulfilled', label: 'Unfulfilled' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
];

const ORDER_SOURCES = [
    { value: 'website', label: 'Website' },
    { value: 'pos', label: 'POS' },
];

// Mock orders data (lineItems unitPriceCents × quantity should match total where noted)
const MOCK_ORDERS = [
    {
        id: 'ORD-1082',
        customer: 'Alex Rivera',
        email: 'alex.rivera@email.com',
        date: '2025-02-17T14:32',
        status: 'shipped',
        fulfillment: 'shipped',
        tracking: '1Z999AA10123456784',
        total: 747,
        items: 3,
        refunded: false,
        source: 'website',
        address: {
            line1: '4421 Maple Ave',
            line2: 'Apt 12B',
            city: 'Austin',
            state: 'TX',
            zip: '78751',
            country: 'USA',
        },
        lineItems: [
            { name: 'Carne seca clássica (8 oz)', quantity: 2, unitPriceCents: 299 },
            { name: 'Picanha strips (4 oz)', quantity: 1, unitPriceCents: 249 },
        ],
        promoCode: 'WELCOME10',
        discountCents: 100,
    },
    {
        id: 'ORD-1081',
        customer: 'Jordan Lee',
        email: 'jordan.lee@email.com',
        date: '2025-02-16T09:15',
        status: 'delivered',
        fulfillment: 'delivered',
        tracking: '1Z999AA10123456783',
        total: 1242,
        items: 5,
        refunded: false,
        source: 'pos',
        address: {
            line1: '8800 Sunset Blvd',
            city: 'Los Angeles',
            state: 'CA',
            zip: '90069',
            country: 'USA',
        },
        lineItems: [
            { name: 'Family bundle (mixed)', quantity: 2, unitPriceCents: 449 },
            { name: 'Garlic & herb (8 oz)', quantity: 2, unitPriceCents: 172 },
            { name: 'Gift box sleeve', quantity: 1, unitPriceCents: 0 },
        ],
    },
    {
        id: 'ORD-1080',
        customer: 'Sam Chen',
        email: 'sam.chen@email.com',
        date: '2025-02-16T09:15',
        status: 'pending',
        fulfillment: 'unfulfilled',
        tracking: '',
        total: 389,
        items: 1,
        refunded: false,
        source: 'website',
        address: {
            line1: '19 Pearl St',
            city: 'Denver',
            state: 'CO',
            zip: '80203',
            country: 'USA',
        },
        lineItems: [{ name: 'Trial pack sampler', quantity: 1, unitPriceCents: 389 }],
    },
    {
        id: 'ORD-1079',
        customer: 'Morgan Taylor',
        email: 'morgan.taylor@email.com',
        date: '2025-02-15T16:45',
        status: 'shipped',
        fulfillment: 'shipped',
        tracking: '1Z999AA10123456782',
        total: 621,
        items: 2,
        refunded: false,
        source: 'pos',
        address: {
            line1: '200 W Lake St',
            line2: 'Suite 400',
            city: 'Chicago',
            state: 'IL',
            zip: '60606',
            country: 'USA',
        },
        lineItems: [
            { name: 'Premium reserve (12 oz)', quantity: 1, unitPriceCents: 499 },
            { name: 'Spicy chile (4 oz)', quantity: 1, unitPriceCents: 122 },
        ],
    },
    {
        id: 'ORD-1078',
        customer: 'Riley Adams',
        email: 'riley.adams@email.com',
        date: '2025-02-15T16:45',
        status: 'pending',
        fulfillment: 'unfulfilled',
        tracking: '',
        total: 156,
        items: 1,
        refunded: false,
        source: 'website',
        address: {
            line1: '55 Water St',
            city: 'Brooklyn',
            state: 'NY',
            zip: '11201',
            country: 'USA',
        },
        lineItems: [{ name: 'Snack size (2 oz)', quantity: 1, unitPriceCents: 156 }],
    },
    {
        id: 'ORD-1077',
        customer: 'Casey Kim',
        email: 'casey.kim@email.com',
        date: '2025-02-14T11:20',
        status: 'delivered',
        fulfillment: 'delivered',
        tracking: '1Z999AA10123456781',
        total: 934,
        items: 4,
        refunded: false,
        source: 'pos',
        address: {
            line1: '1 Ferry Building',
            city: 'San Francisco',
            state: 'CA',
            zip: '94111',
            country: 'USA',
        },
        lineItems: [
            { name: 'Original recipe (8 oz)', quantity: 2, unitPriceCents: 299 },
            { name: 'Teriyaki glaze (8 oz)', quantity: 2, unitPriceCents: 168 },
        ],
    },
    {
        id: 'ORD-1076',
        customer: 'Drew Morgan',
        email: 'drew.morgan@email.com',
        date: '2025-02-13T08:00',
        status: 'refunded',
        fulfillment: 'delivered',
        tracking: '',
        total: 428,
        items: 2,
        refunded: true,
        source: 'website',
        address: {
            line1: '77 King St',
            city: 'Charleston',
            state: 'SC',
            zip: '29401',
            country: 'USA',
        },
        lineItems: [
            { name: 'Smoked batch (8 oz)', quantity: 1, unitPriceCents: 279 },
            { name: 'Traditional cut (8 oz)', quantity: 1, unitPriceCents: 149 },
        ],
    },
    {
        id: 'ORD-1075',
        customer: 'Quinn Blake',
        email: 'quinn.blake@email.com',
        date: '2025-02-12T19:30',
        status: 'refunded',
        fulfillment: 'shipped',
        tracking: '',
        total: 612,
        items: 3,
        refunded: true,
        source: 'pos',
        address: {
            line1: '3400 Main St',
            city: 'Houston',
            state: 'TX',
            zip: '77002',
            country: 'USA',
        },
        lineItems: [
            { name: 'Bulk pack (16 oz)', quantity: 1, unitPriceCents: 300 },
            { name: 'Heat & eat pouch (6 oz)', quantity: 2, unitPriceCents: 156 },
        ],
    },
];

const STATUS_STYLES = {
    pending: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    shipped: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400',
    delivered: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    refunded: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
    voided: 'border-zinc-500/40 bg-zinc-500/10 text-zinc-400',
};

function escapeCsv(val) {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
    return s;
}

function formatCurrency(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
}

function formatDateTime(dateStr) {
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

function formatAddress(addr) {
    if (!addr || typeof addr !== 'object') return '—';
    const line2 = addr.line2?.trim();
    const cityLine = [addr.city, addr.state].filter(Boolean).join(', ');
    const cityZip = [cityLine, addr.zip].filter(Boolean).join(' ');
    const parts = [addr.line1?.trim(), line2 || null, cityZip.trim() || null, addr.country?.trim()].filter(Boolean);
    return parts.length ? parts.join('\n') : '—';
}

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

function newCreateOrderLineKey() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeProductsFetch(data) {
    return Array.isArray(data) ? data : [];
}

function isProductOrderable(p) {
    return String(p?.status ?? '').toLowerCase() === 'active';
}

function formatProductLineName(product) {
    const name = String(product?.name ?? '').trim() || 'Product';
    const flavor = String(product?.flavor ?? '').trim();
    return flavor ? `${name} (${flavor})` : name;
}

function computeCreateOrderPreview(lines, products) {
    const active = products.filter(isProductOrderable);
    const byId = new Map(active.map((p) => [String(p.id), p]));
    let totalCents = 0;
    let unitCount = 0;
    for (const line of lines) {
        const p = byId.get(String(line.productId));
        const qty = Math.max(0, parseInt(String(line.quantity), 10) || 0);
        if (!p || qty <= 0) continue;
        const unit = Math.round(Number(p.price_cents) || 0);
        totalCents += unit * qty;
        unitCount += qty;
    }
    return { totalCents, unitCount, hasValidLine: unitCount > 0 };
}

const FULFILLMENT_TO_STATUS = {
    unfulfilled: 'pending',
    shipped: 'shipped',
    delivered: 'delivered',
};

/** Legacy rows may still have fulfillment/status "processing"; treat as unfulfilled / pending for UI. */
function normalizeFulfillmentValue(f) {
    return f === 'processing' ? 'unfulfilled' : (f ?? 'unfulfilled');
}

function fulfillmentLabel(f) {
    const v = normalizeFulfillmentValue(f);
    return FULFILLMENT_OPTIONS.find((o) => o.value === v)?.label ?? v ?? '—';
}

function orderStatusForFilter(o) {
    if (o.status === 'processing') return 'pending';
    return o.status;
}

function OrdersTable({
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
        items: 1,
        total: '',
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
        () => (detailOrderId ? allOrders.find((o) => o.id === detailOrderId) ?? null : null),
        [detailOrderId, allOrders],
    );

    React.useEffect(() => {
        if (detailOrderId && !detailOrder) setDetailOrderId(null);
    }, [detailOrderId, detailOrder]);

    const detailLineSubtotal = detailOrder?.lineItems?.length ? lineItemsSubtotalCents(detailOrder.lineItems) : null;
    const detailDiscountCents = detailOrder ? orderDiscountCents(detailOrder) : 0;
    const detailPromoCode = detailOrder ? orderPromoCode(detailOrder) : '';
    const detailExpectedAfterDiscount =
        detailLineSubtotal != null ? detailLineSubtotal - detailDiscountCents : null;

    const getStatus = (order) => {
        if (order.voided) return 'voided';
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
            items: order.items ?? 1,
            total: (order.total / 100).toFixed(2),
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
        const raw = String(editForm.total ?? '').trim().replace(/[^0-9.]/g, '');
        const total = Math.round(parseFloat(raw || 0) * 100) || 0;
        const id = editingOrder.id;
        onUpdateOrder(id, {
            customer: (editForm.customer ?? '').trim() || 'Unknown',
            email: (editForm.email ?? '').trim(),
            items: Math.max(1, parseInt(String(editForm.items), 10) || 1),
            total,
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
                : editingOrder.voided
                  ? editingOrder.status
                : (FULFILLMENT_TO_STATUS[editForm.fulfillment ?? 'unfulfilled'] ?? 'pending'),
        });
        setEditOpen(false);
        setEditingOrder(null);
    };

    const handleQuickFulfillmentUpdate = (order, nextFulfillment) => {
        if (!order || order.refunded || order.voided) return;
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
                            <TableHead className="text-zinc-400 h-8 px-2 text-[10px] text-right w-14">Actions</TableHead>
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
                                    <TableCell
                                        className="px-2 py-1.5 text-right"
                                        onClick={(e) => e.stopPropagation()}
                                    >
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
                                                    onClick={() =>
                                                        onUpdateOrder(order.id, {
                                                            refunded: true,
                                                            status: 'refunded',
                                                        })
                                                    }
                                                    disabled={order.refunded || order.voided}
                                                >
                                                    <RotateCcw className="mr-2 size-3.5" />
                                                    {order.refunded ? 'Already refunded' : 'Mark refunded'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="cursor-pointer text-xs focus:bg-zinc-800 focus:text-zinc-100"
                                                    onClick={() =>
                                                        onUpdateOrder(order.id, {
                                                            voided: true,
                                                            status: 'voided',
                                                            fulfillment: 'unfulfilled',
                                                            tracking: '',
                                                        })
                                                    }
                                                    disabled={order.voided || order.refunded}
                                                >
                                                    <CircleOff className="mr-2 size-3.5" />
                                                    {order.voided ? 'Already voided' : 'Void order'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="cursor-pointer text-xs focus:bg-zinc-800 focus:text-zinc-100"
                                                    onClick={() => setPackingSlipOrder(order)}
                                                    disabled={order.refunded || order.voided}
                                                >
                                                    <Printer className="mr-2 size-3.5" />
                                                    Print packing slip
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
                                <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">Items to pack</p>
                                <div className="rounded border border-zinc-800 overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Item</TableHead>
                                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500 text-right w-16">
                                                    Qty
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(packingSlipOrder.lineItems?.length
                                                ? packingSlipOrder.lineItems
                                                : [{ name: `${packingSlipOrder.items ?? 0} item(s)`, quantity: packingSlipOrder.items ?? 0 }]
                                            ).map((li, idx) => (
                                                <TableRow key={`${packingSlipOrder.id}-pack-li-${idx}`} className="border-zinc-800">
                                                    <TableCell className="px-3 py-2 text-xs text-zinc-200">{li.name}</TableCell>
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
                                    <span className="text-zinc-300">
                                        {fulfillmentLabel(detailOrder.fulfillment)}
                                    </span>
                                </span>
                                {detailOrder.tracking?.trim() ? (
                                    <span className="text-zinc-500 text-[11px] font-mono">
                                        Tracking:{' '}
                                        <span className="text-zinc-300">{detailOrder.tracking}</span>
                                    </span>
                                ) : null}
                                {!detailOrder.refunded && !detailOrder.voided ? (
                                    <>
                                        {detailOrder.fulfillment !== 'shipped' && detailOrder.fulfillment !== 'delivered' ? (
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="h-6 px-2 text-[10px] bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                                                onClick={() =>
                                                    handleQuickFulfillmentUpdate(detailOrder, 'shipped')
                                                }
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
                                                onClick={() =>
                                                    handleQuickFulfillmentUpdate(detailOrder, 'delivered')
                                                }
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
                                                    const lineTotal =
                                                        (li.quantity ?? 0) * (li.unitPriceCents ?? 0);
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
                                        No line breakdown on file. Item count (summary):{' '}
                                        {detailOrder.items ?? 0}
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
                                        <span>
                                            Discount{detailPromoCode ? ` (${detailPromoCode})` : ''}
                                        </span>
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
                                {detailExpectedAfterDiscount != null && detailExpectedAfterDiscount !== detailOrder.total ? (
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
                        <DialogDescription>
                            {editingOrder ? `Update ${editingOrder.id}` : ''}
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
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-order-items" className="text-xs text-zinc-400">
                                    Items
                                </Label>
                                <Input
                                    id="edit-order-items"
                                    type="number"
                                    min={1}
                                    value={editForm.items ?? 1}
                                    onChange={(e) =>
                                        setEditForm((f) => ({
                                            ...f,
                                            items: parseInt(e.target.value, 10) || 1,
                                        }))
                                    }
                                    className="h-9 border-zinc-700 bg-zinc-950/80 text-zinc-100"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-order-total" className="text-xs text-zinc-400">
                                    Total ($)
                                </Label>
                                <Input
                                    id="edit-order-total"
                                    value={editForm.total ?? ''}
                                    onChange={(e) => setEditForm((f) => ({ ...f, total: e.target.value }))}
                                    className="h-9 border-zinc-700 bg-zinc-950/80 text-zinc-100"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-400">Fulfillment</Label>
                            <Select
                                value={editForm.fulfillment ?? 'unfulfilled'}
                                onValueChange={(v) => setEditForm((f) => ({ ...f, fulfillment: v }))}
                                disabled={editingOrder?.refunded || editingOrder?.voided}
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

const PAGE_SIZE = 5;

const STATUS_FILTER_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'refunded', label: 'Refunded' },
];

function filterOrdersBySearch(orders, query) {
    if (!query.trim()) return orders;
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
        const sourceLabel =
            ORDER_SOURCES.find((s) => s.value === (o.source ?? 'website'))?.label?.toLowerCase() ?? '';
        const addrBlob = formatAddress(o.address).toLowerCase();
        const lineNames = (o.lineItems ?? [])
            .map((li) => (li.name ?? '').toLowerCase())
            .join(' ');
        return (
            o.id.toLowerCase().includes(q) ||
            o.customer.toLowerCase().includes(q) ||
            (o.email && o.email.toLowerCase().includes(q)) ||
            sourceLabel.includes(q) ||
            addrBlob.includes(q) ||
            lineNames.includes(q) ||
            o.date.includes(q) ||
            (o.tracking && o.tracking.toLowerCase().includes(q))
    );
    });
}

function getOrderDate(order) {
    const d = new Date(order.date);
    return isNaN(d.getTime()) ? null : d;
}

function applyOrderFilters(orders, statusFilter, fulfillmentFilter, dateRange) {
    return orders.filter((o) => {
        if (statusFilter !== 'all' && orderStatusForFilter(o) !== statusFilter) return false;
        if (fulfillmentFilter !== 'all' && normalizeFulfillmentValue(o.fulfillment) !== fulfillmentFilter)
            return false;

        const orderDate = getOrderDate(o);
        if (!orderDate) return true;

        if (dateRange?.from) {
            const startOfDay = new Date(dateRange.from);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
            endOfDay.setHours(23, 59, 59, 999);
            const t = orderDate.getTime();
            if (t < startOfDay.getTime() || t > endOfDay.getTime()) return false;
        }

        return true;
    });
}

function PaginationBar({ total, currentPage, pageSize, onPageChange }) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, total);

    if (total === 0) return null;

    return (
        <div className="flex w-full items-center justify-between gap-4 border-t border-zinc-800/80 px-4 py-3">
            <p className="text-zinc-500 text-xs">
                Showing {start + 1}–{end} of {total}
            </p>
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80"
                    onClick={() => onPageChange((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                >
                    <ChevronLeft className="size-3.5" />
                    Prev
                </Button>
                <span className="px-2 text-xs text-zinc-500">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80"
                    onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                >
                    Next
                    <ChevronRight className="size-3.5" />
                </Button>
            </div>
        </div>
    );
}

export default function OrdersPage() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('all');
    const [filterFulfillment, setFilterFulfillment] = React.useState('all');
    const [dateRange, setDateRange] = React.useState({ from: undefined, to: undefined });
    const [currentPage, setCurrentPage] = React.useState(1);
    const [dateSortOrder, setDateSortOrder] = React.useState('desc');
    const [createModalOpen, setCreateModalOpen] = React.useState(false);
    const [orders, setOrders] = React.useState(MOCK_ORDERS);
    const [catalogProducts, setCatalogProducts] = React.useState([]);
    const [catalogLoading, setCatalogLoading] = React.useState(false);
    const [catalogError, setCatalogError] = React.useState(null);
    const [createOrderLines, setCreateOrderLines] = React.useState(() => [
        { key: newCreateOrderLineKey(), productId: '', quantity: 1 },
    ]);
    const [newOrderForm, setNewOrderForm] = React.useState({
        customer: '',
        email: '',
        fulfillment: 'unfulfilled',
        source: 'website',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        country: '',
    });

    const resetNewOrderForm = () => {
        setNewOrderForm({
            customer: '',
            email: '',
            fulfillment: 'unfulfilled',
            source: 'website',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            zip: '',
            country: '',
        });
        setCreateOrderLines([{ key: newCreateOrderLineKey(), productId: '', quantity: 1 }]);
    };

    React.useEffect(() => {
        if (!createModalOpen) return undefined;
        let cancelled = false;
        setCatalogLoading(true);
        setCatalogError(null);
        getProducts()
            .then((data) => {
                if (cancelled) return;
                setCatalogProducts(normalizeProductsFetch(data));
            })
            .catch(() => {
                if (!cancelled) {
                    setCatalogError('Could not load catalog');
                    setCatalogProducts([]);
                }
            })
            .finally(() => {
                if (!cancelled) setCatalogLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [createModalOpen]);

    const createPreview = React.useMemo(
        () => computeCreateOrderPreview(createOrderLines, catalogProducts),
        [createOrderLines, catalogProducts],
    );

    const orderableCatalog = React.useMemo(
        () => [...catalogProducts].filter(isProductOrderable).sort((a, b) => String(a.name).localeCompare(String(b.name))),
        [catalogProducts],
    );

    const allOrders = orders;

    const getNextOrderId = () => {
        const nums = orders.map((o) => parseInt(o.id.replace(/\D/g, ''), 10)).filter(Boolean);
        const max = nums.length ? Math.max(...nums) : 1082;
        return `ORD-${max + 1}`;
    };

    const handleCreateOrder = () => {
        const byId = new Map(orderableCatalog.map((p) => [String(p.id), p]));
        const merged = new Map();
        for (const line of createOrderLines) {
            const p = byId.get(String(line.productId));
            const qty = Math.max(0, parseInt(String(line.quantity), 10) || 0);
            if (!p || qty <= 0) continue;
            const id = String(p.id);
            const unitPriceCents = Math.round(Number(p.price_cents) || 0);
            const prev = merged.get(id);
            if (prev) prev.quantity += qty;
            else merged.set(id, { product: p, quantity: qty, unitPriceCents });
        }
        const lineItems = [...merged.values()].map(({ product, quantity, unitPriceCents }) => ({
            name: formatProductLineName(product),
            quantity,
            unitPriceCents,
        }));
        if (!lineItems.length) return;

        const total = lineItems.reduce((s, li) => s + li.quantity * li.unitPriceCents, 0);
        const items = lineItems.reduce((s, li) => s + li.quantity, 0);
        const fulfillment = newOrderForm.fulfillment ?? 'unfulfilled';
        const status = FULFILLMENT_TO_STATUS[fulfillment] ?? 'pending';
        const line2 = (newOrderForm.addressLine2 ?? '').trim();
        const address = {
            line1: (newOrderForm.addressLine1 ?? '').trim(),
            ...(line2 ? { line2 } : {}),
            city: (newOrderForm.city ?? '').trim(),
            state: (newOrderForm.state ?? '').trim(),
            zip: (newOrderForm.zip ?? '').trim(),
            country: (newOrderForm.country ?? '').trim(),
        };
        setOrders((prev) => [
            {
                id: getNextOrderId(),
                customer: (newOrderForm.customer ?? '').trim() || 'Unknown',
                email: (newOrderForm.email ?? '').trim(),
                date: new Date().toISOString().slice(0, 16),
                status,
                fulfillment,
                tracking: '',
                total,
                items,
                refunded: false,
                source: newOrderForm.source === 'pos' ? 'pos' : 'website',
                address,
                lineItems,
            },
            ...prev,
        ]);
        setCreateModalOpen(false);
        resetNewOrderForm();
    };

    const updateCreateLine = (key, patch) => {
        setCreateOrderLines((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
    };

    const addCreateOrderLine = () => {
        setCreateOrderLines((rows) => [...rows, { key: newCreateOrderLineKey(), productId: '', quantity: 1 }]);
    };

    const removeCreateOrderLine = (key) => {
        setCreateOrderLines((rows) => {
            const next = rows.filter((r) => r.key !== key);
            return next.length ? next : [{ key: newCreateOrderLineKey(), productId: '', quantity: 1 }];
        });
    };

    const handleUpdateOrder = React.useCallback((id, updates) => {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
    }, []);

    const pendingOrders = React.useMemo(
        () =>
            allOrders.filter(
                (o) => !o.refunded && (o.status === 'pending' || o.status === 'processing'),
            ),
        [allOrders],
    );
    const refundedOrders = React.useMemo(() => allOrders.filter((o) => o.refunded), [allOrders]);

    const filteredOrders = React.useMemo(() => {
        const bySearch = filterOrdersBySearch(allOrders, searchQuery);
        return applyOrderFilters(bySearch, filterStatus, filterFulfillment, dateRange);
    }, [allOrders, searchQuery, filterStatus, filterFulfillment, dateRange]);

    const sortedOrders = React.useMemo(() => {
        return [...filteredOrders].sort((a, b) => {
            const da = new Date(a.date).getTime();
            const db = new Date(b.date).getTime();
            return dateSortOrder === 'asc' ? da - db : db - da;
        });
    }, [filteredOrders, dateSortOrder]);

    const toggleDateSort = React.useCallback(() => {
        setDateSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    }, []);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus, filterFulfillment, dateRange]);

    const ordersForTab = sortedOrders;
    const totalPages = Math.max(1, Math.ceil(ordersForTab.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedOrders = ordersForTab.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const handleExportCsv = () => {
        const headers = [
            'Order ID',
            'Customer',
            'Email',
            'Source',
            'Date',
            'Items',
            'Status',
            'Fulfillment',
            'Tracking',
            'Total',
            'Refunded',
        ];
        const rows = sortedOrders.map((o) =>
            [
                o.id,
                o.customer,
                o.email ?? '',
                ORDER_SOURCES.find((s) => s.value === (o.source ?? 'website'))?.label ?? 'Website',
                formatDateTime(o.date),
                o.items ?? 0,
                o.status,
                o.fulfillment,
                o.tracking ?? '',
                formatCurrency(o.total),
                o.refunded ? 'Yes' : 'No',
            ]
                .map(escapeCsv)
                .join(','),
        );
        const csv = [headers.map(escapeCsv).join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const orderMetrics = React.useMemo(() => {
        const total = allOrders.length;
        const pending = pendingOrders.length;
        const revenue = allOrders.filter((o) => !o.refunded).reduce((sum, o) => sum + o.total, 0);
        const refunded = refundedOrders.length;
        const refundedAmount = refundedOrders.reduce((sum, o) => sum + o.total, 0);
        return [
            {
                label: 'Total Orders',
                value: String(total),
                sublabel: 'All orders',
                icon: ShoppingBag,
                accent: 'neutral',
            },
            {
                label: 'Pending Fulfillment',
                value: String(pending),
                sublabel: 'Need action',
                icon: Clock,
                accent: pending > 0 ? 'amber' : 'neutral',
            },
            {
                label: 'Revenue',
                value: formatCurrency(revenue),
                sublabel: 'Active orders',
                icon: DollarSign,
                accent: 'emerald',
            },
            {
                label: 'Refunded',
                value: `${refunded} (${formatCurrency(refundedAmount)})`,
                sublabel: 'Orders',
                icon: RotateCcw,
                accent: refunded > 0 ? 'red' : 'neutral',
            },
        ];
    }, [allOrders, pendingOrders, refundedOrders]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-zinc-100 text-xl font-semibold tracking-tight">Order Command</h1>
                    <p className="text-zinc-500 mt-1 text-sm">Manage fulfillment and tracking</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        size="sm"
                        className="h-9 gap-1.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs shrink-0"
                        onClick={() => setCreateModalOpen(true)}
                    >
                        <Plus className="size-3.5" />
                        Create Order
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Overview</span>
                    <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                </div>
            <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
                {orderMetrics.map((m) => {
                    const Icon = m.icon;
                    const accentCls =
                        m.accent === 'emerald'
                            ? 'text-emerald-400/80'
                            : m.accent === 'amber'
                              ? 'text-amber-400/80'
                              : m.accent === 'red'
                                ? 'text-red-400/80'
                                : 'text-zinc-500';
                    const valueCls =
                        m.accent === 'emerald'
                            ? 'text-emerald-400'
                            : m.accent === 'amber'
                              ? 'text-amber-400'
                              : m.accent === 'red'
                                ? 'text-red-400'
                                : 'text-zinc-100';
                    return (
                        <div
                            key={m.label}
                            className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5"
                        >
                            <Icon className={cn('size-4 shrink-0', accentCls)} />
                            <div className="min-w-0">
                                <p className="truncate text-zinc-400 text-[10px]">{m.label}</p>
                                <p className={cn('text-sm font-semibold tabular-nums', valueCls)}>{m.value}</p>
                                <p className="mt-0.5 truncate text-zinc-500 text-[9px]">{m.sublabel}</p>
                            </div>
                        </div>
                    );
                })}
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                    <div className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
                {STATUS_FILTER_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFilterStatus(opt.value)}
                        className={cn(
                                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                            filterStatus === opt.value
                                        ? 'bg-zinc-700 text-zinc-100'
                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50',
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
                    </div>
                    <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
                        {[
                            { value: 'all', label: 'All' },
                            { value: 'unfulfilled', label: 'Unfulfilled' },
                        ].map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                                onClick={() => setFilterFulfillment(opt.value)}
                        className={cn(
                                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                                    filterFulfillment === opt.value
                                        ? 'bg-zinc-700 text-zinc-100'
                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50',
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                    onClick={handleExportCsv}
                >
                    <Download className="size-4" />
                    Export CSV
                </Button>
            </div>

            <div className="mt-4">
                <OrdersTable
                    orders={paginatedOrders}
                    allOrders={sortedOrders}
                    hasActiveSearch={
                        !!searchQuery.trim() ||
                        filterStatus !== 'all' ||
                        filterFulfillment !== 'all' ||
                        !!dateRange?.from
                    }
                    dateSortOrder={dateSortOrder}
                    onDateSortToggle={toggleDateSort}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onUpdateOrder={handleUpdateOrder}
                    pagination={
                        <PaginationBar
                            total={filteredOrders.length}
                            currentPage={safePage}
                            pageSize={PAGE_SIZE}
                            onPageChange={setCurrentPage}
                        />
                    }
                />
            </div>

            <Dialog
                open={createModalOpen}
                onOpenChange={(open) => {
                    setCreateModalOpen(open);
                    if (!open) resetNewOrderForm();
                }}
            >
                <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto border-zinc-800 bg-zinc-900 sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Create Order</DialogTitle>
                        <DialogDescription>Add a manual order.</DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleCreateOrder();
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
                                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                                    Line items
                                </p>
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
                                onClick={() => setCreateModalOpen(false)}
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    catalogLoading ||
                                    !!catalogError ||
                                    !createPreview.hasValidLine ||
                                    orderableCatalog.length === 0
                                }
                                className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 disabled:opacity-50"
                            >
                                Create Order
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
