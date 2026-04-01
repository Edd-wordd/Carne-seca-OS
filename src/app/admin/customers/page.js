'use client';

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

/** Mock only — no DB. Each order includes line items with per-line revenue for rollups. */
const MOCK_CUSTOMERS = [
    {
        id: 'cust-1',
        name: 'Alex Rivera',
        email: 'alex.rivera@email.com',
        notes: 'VIP — prefers spicy batches; mention new chile SKU.',
        orders: [
            {
                id: 'ORD-1082',
                date: '2026-02-17T14:32',
                totalCents: 84700,
                items: [
                    { name: 'Carne seca clássica (8 oz)', qty: 2, lineTotalCents: 59800 },
                    { name: 'Picanha strips (4 oz)', qty: 1, lineTotalCents: 24900 },
                ],
            },
            {
                id: 'ORD-1041',
                date: '2026-01-05T11:20',
                totalCents: 59800,
                items: [{ name: 'Carne seca clássica (8 oz)', qty: 2, lineTotalCents: 59800 }],
            },
            {
                id: 'ORD-1012',
                date: '2025-11-22T09:15',
                totalCents: 124200,
                items: [
                    { name: 'Family bundle (mixed)', qty: 2, lineTotalCents: 89800 },
                    { name: 'Garlic & herb (8 oz)', qty: 2, lineTotalCents: 34400 },
                ],
            },
        ],
    },
    {
        id: 'cust-2',
        name: 'Jordan Lee',
        email: 'jordan.lee@email.com',
        notes: 'Retail pickup sometimes; confirm hours before ship.',
        orders: [
            {
                id: 'ORD-1081',
                date: '2026-02-16T09:15',
                totalCents: 124200,
                items: [
                    { name: 'Family bundle (mixed)', qty: 2, lineTotalCents: 89800 },
                    { name: 'Garlic & herb (8 oz)', qty: 2, lineTotalCents: 34400 },
                    { name: 'Gift box sleeve', qty: 1, lineTotalCents: 0 },
                ],
            },
        ],
    },
    {
        id: 'cust-3',
        name: 'Sam Chen',
        email: 'sam.chen@email.com',
        notes: '',
        orders: [
            {
                id: 'ORD-1080',
                date: '2026-02-16T09:15',
                totalCents: 38900,
                items: [{ name: 'Trial pack sampler', qty: 1, lineTotalCents: 38900 }],
            },
            {
                id: 'ORD-992',
                date: '2025-12-01T16:40',
                totalCents: 38900,
                items: [{ name: 'Trial pack sampler', qty: 1, lineTotalCents: 38900 }],
            },
        ],
    },
    {
        id: 'cust-4',
        name: 'Morgan Taylor',
        email: 'morgan.taylor@email.com',
        notes: 'Wholesale contact — net 30.',
        orders: [
            {
                id: 'ORD-1079',
                date: '2026-02-15T16:45',
                totalCents: 62100,
                items: [
                    { name: 'Premium reserve (12 oz)', qty: 1, lineTotalCents: 49900 },
                    { name: 'Spicy chile (4 oz)', qty: 1, lineTotalCents: 12200 },
                ],
            },
            {
                id: 'ORD-965',
                date: '2026-01-18T13:10',
                totalCents: 93400,
                items: [
                    { name: 'Original recipe (8 oz)', qty: 2, lineTotalCents: 59800 },
                    { name: 'Teriyaki glaze (8 oz)', qty: 2, lineTotalCents: 33600 },
                ],
            },
            {
                id: 'ORD-910',
                date: '2025-10-03T10:00',
                totalCents: 62100,
                items: [
                    { name: 'Premium reserve (12 oz)', qty: 1, lineTotalCents: 49900 },
                    { name: 'Spicy chile (4 oz)', qty: 1, lineTotalCents: 12200 },
                ],
            },
        ],
    },
];

function formatCurrency(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format((Number(cents) || 0) / 100);
}

function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function summarizeCustomer(c) {
    const orders = c.orders ?? [];
    const totalOrders = orders.length;
    const totalSpentCents = orders.reduce((s, o) => s + (o.totalCents ?? 0), 0);
    const lastOrderDate =
        orders.length === 0
            ? null
            : orders.reduce((best, o) => {
                  const t = new Date(o.date).getTime();
                  return !best || t > new Date(best).getTime() ? o.date : best;
              }, null);
    return {
        ...c,
        totalOrders,
        totalSpentCents,
        lastOrderDate,
    };
}

function orderFrequencyLabel(orders) {
    if (orders.length === 0) return 'No orders';
    if (orders.length === 1) return 'Single order so far';
    const sorted = [...orders].sort((a, b) => new Date(a.date) - new Date(b.date));
    const first = new Date(sorted[0].date).getTime();
    const last = new Date(sorted[sorted.length - 1].date).getTime();
    const spanDays = Math.max(1, (last - first) / (86400000));
    const avg = spanDays / (sorted.length - 1);
    if (avg <= 10) return `~${Math.round(avg)} days between orders`;
    if (avg <= 45) return `~${Math.round(avg / 7)} weeks between orders`;
    return `~${(avg / 30).toFixed(1)} months between orders`;
}

function aggregatePurchases(orders) {
    const map = new Map();
    for (const o of orders) {
        for (const li of o.items ?? []) {
            const name = li.name ?? 'Item';
            const prev = map.get(name) ?? {
                name,
                totalQty: 0,
                revenueCents: 0,
                orderIds: new Set(),
            };
            prev.totalQty += li.qty ?? 0;
            prev.revenueCents += li.lineTotalCents ?? 0;
            prev.orderIds.add(o.id);
            map.set(name, prev);
        }
    }
    return [...map.values()]
        .map(({ orderIds, ...rest }) => ({
            ...rest,
            orderCount: orderIds.size,
        }))
        .sort((a, b) => b.revenueCents - a.revenueCents);
}

export default function CustomersPage() {
    const [query, setQuery] = React.useState('');
    const [detailCustomer, setDetailCustomer] = React.useState(null);
    const [notesDraft, setNotesDraft] = React.useState('');

    const rows = React.useMemo(() => MOCK_CUSTOMERS.map(summarizeCustomer), []);

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                c.id.toLowerCase().includes(q),
        );
    }, [query, rows]);

    React.useEffect(() => {
        if (detailCustomer) setNotesDraft(detailCustomer.notes ?? '');
    }, [detailCustomer]);

    const detailOrders = React.useMemo(
        () => detailCustomer?.orders ?? [],
        [detailCustomer],
    );
    const detailPurchases = React.useMemo(
        () => (detailCustomer ? aggregatePurchases(detailOrders) : []),
        [detailCustomer, detailOrders],
    );
    const avgOrderCents = React.useMemo(() => {
        if (detailOrders.length === 0) return 0;
        return Math.round(
            detailOrders.reduce((s, o) => s + (o.totalCents ?? 0), 0) / detailOrders.length,
        );
    }, [detailOrders]);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-zinc-100 text-xl font-semibold tracking-tight">Customers</h1>
                <p className="text-zinc-500 mt-1 text-sm">
                    Directory only — mock UI. Open a customer for order history, purchases, and notes.
                </p>
            </div>

            <div className="overflow-hidden rounded border border-zinc-800">
                <div className="border-b border-zinc-800 bg-zinc-900/80 px-3 py-2">
                    <div className="relative max-w-xs">
                        <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                        <Input
                            placeholder="Search name or email…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="h-7 border-zinc-700 bg-zinc-950 pl-8 text-[10px] text-zinc-100 placeholder:text-zinc-500"
                        />
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="border-zinc-800 hover:bg-transparent">
                            <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Name</TableHead>
                            <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Email</TableHead>
                            <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">Orders</TableHead>
                            <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">Total spent</TableHead>
                            <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Last order</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow className="border-zinc-800">
                                <TableCell colSpan={5} className="py-6 text-center text-xs text-zinc-500">
                                    No customers match your search.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((c) => (
                                <TableRow
                                    key={c.id}
                                    tabIndex={0}
                                    className="cursor-pointer border-zinc-800 transition-colors hover:bg-zinc-800/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-500"
                                    onClick={() => setDetailCustomer(MOCK_CUSTOMERS.find((x) => x.id === c.id) ?? null)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setDetailCustomer(MOCK_CUSTOMERS.find((x) => x.id === c.id) ?? null);
                                        }
                                    }}
                                >
                                    <TableCell className="px-3 py-2 text-[11px] font-medium text-zinc-200">
                                        {c.name}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-[11px] text-zinc-400">{c.email}</TableCell>
                                    <TableCell className="px-3 py-2 text-right text-[11px] tabular-nums text-zinc-400">
                                        {c.totalOrders}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-right text-[11px] font-medium tabular-nums text-emerald-400">
                                        {formatCurrency(c.totalSpentCents)}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-[11px] text-zinc-400 tabular-nums">
                                        {formatDateTime(c.lastOrderDate)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!detailCustomer} onOpenChange={(o) => !o && setDetailCustomer(null)}>
                <DialogContent className="max-h-[min(90vh,760px)] overflow-y-auto border-zinc-800 bg-zinc-900 sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-100">{detailCustomer?.name ?? 'Customer'}</DialogTitle>
                        <DialogDescription className="text-zinc-400 text-xs">
                            {detailCustomer?.email ?? ''}
                        </DialogDescription>
                    </DialogHeader>
                    {detailCustomer ? (
                        <div className="space-y-5 text-sm">
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {[
                                    { label: 'Orders', value: String(detailOrders.length) },
                                    {
                                        label: 'Total spent',
                                        value: formatCurrency(
                                            detailOrders.reduce((s, o) => s + (o.totalCents ?? 0), 0),
                                        ),
                                    },
                                    { label: 'Avg order', value: formatCurrency(avgOrderCents) },
                                    {
                                        label: 'Last order',
                                        value: formatDateTime(
                                            detailOrders.reduce(
                                                (best, o) =>
                                                    !best || new Date(o.date) > new Date(best) ? o.date : best,
                                                null,
                                            ),
                                        ),
                                    },
                                ].map((x) => (
                                    <div
                                        key={x.label}
                                        className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2"
                                    >
                                        <p className="text-[9px] uppercase tracking-wider text-zinc-500">{x.label}</p>
                                        <p className="mt-0.5 text-xs font-semibold tabular-nums text-zinc-100">
                                            {x.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                                    How often
                                </p>
                                <p className="mt-1 text-xs text-zinc-300">{orderFrequencyLabel(detailOrders)}</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cust-notes" className="text-xs text-zinc-400">
                                    Notes
                                </Label>
                                <textarea
                                    id="cust-notes"
                                    value={notesDraft}
                                    onChange={(e) => setNotesDraft(e.target.value)}
                                    placeholder="Internal notes (mock — not saved)"
                                    rows={3}
                                    className={cn(
                                        'min-h-[80px] w-full resize-none rounded-md border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-100 shadow-xs outline-none placeholder:text-zinc-600',
                                        'focus-visible:border-zinc-600 focus-visible:ring-2 focus-visible:ring-zinc-600/30',
                                    )}
                                />
                                <p className="text-[10px] text-zinc-600">Preview only; wiring will persist to DB later.</p>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-2">
                                    What they bought
                                </h3>
                                <div className="rounded-md border border-zinc-800 overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">
                                                    Product
                                                </TableHead>
                                                <TableHead className="h-8 px-2 text-[10px] text-zinc-500 text-right w-14">
                                                    Qty
                                                </TableHead>
                                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500 text-right">
                                                    Spent
                                                </TableHead>
                                                <TableHead className="h-8 px-2 text-[10px] text-zinc-500 text-right w-20">
                                                    In orders
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {detailPurchases.map((p) => (
                                                <TableRow key={p.name} className="border-zinc-800">
                                                    <TableCell className="px-3 py-2 text-xs text-zinc-200">
                                                        {p.name}
                                                    </TableCell>
                                                    <TableCell className="px-2 py-2 text-right text-xs tabular-nums text-zinc-400">
                                                        {p.totalQty}
                                                    </TableCell>
                                                    <TableCell className="px-3 py-2 text-right text-xs font-medium tabular-nums text-emerald-400">
                                                        {formatCurrency(p.revenueCents)}
                                                    </TableCell>
                                                    <TableCell className="px-2 py-2 text-right text-xs tabular-nums text-zinc-500">
                                                        {p.orderCount}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-2">
                                    Order history
                                </h3>
                                <div className="rounded-md border border-zinc-800 overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">
                                                    Order
                                                </TableHead>
                                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Date</TableHead>
                                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Items</TableHead>
                                                <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">
                                                    Total
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {[...detailOrders]
                                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                                .map((o) => (
                                                    <TableRow key={o.id} className="border-zinc-800">
                                                        <TableCell className="px-3 py-2 font-mono text-[11px] text-zinc-300">
                                                            {o.id}
                                                        </TableCell>
                                                        <TableCell className="px-3 py-2 text-[11px] text-zinc-400 tabular-nums">
                                                            {formatDateTime(o.date)}
                                                        </TableCell>
                                                        <TableCell className="px-3 py-2 text-[10px] text-zinc-500">
                                                            {(o.items ?? [])
                                                                .map((li) => `${li.qty}× ${li.name}`)
                                                                .join(', ')}
                                                        </TableCell>
                                                        <TableCell className="px-3 py-2 text-right text-[11px] font-medium tabular-nums text-zinc-100">
                                                            {formatCurrency(o.totalCents)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
}
