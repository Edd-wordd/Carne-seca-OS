'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, TicketPercent, CheckCircle2, Hash, CircleDollarSign, Download } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { exportCouponsToCsv } from '@/lib/utils/exportCoupons';

const MOCK_COUPONS = [
    {
        id: 'cpn-1',
        code: 'WELCOME10',
        type: 'percent',
        value: 10,
        maxRedemptions: 500,
        redemptions: 184,
        redeemedValueCents: 83_120, // total discount given across redemptions (mock)
        expiresAt: '2026-12-31',
        active: true,
        note: 'New customers · one per email',
    },
    {
        id: 'cpn-2',
        code: 'RESTOCK5',
        type: 'fixed',
        valueCents: 500,
        maxRedemptions: null,
        redemptions: 42,
        redeemedValueCents: 21_000, // $5 × 42
        expiresAt: '2026-06-01',
        active: true,
        note: '$5 off orders $35+',
    },
    {
        id: 'cpn-3',
        code: 'VIP20',
        type: 'percent',
        value: 20,
        maxRedemptions: 100,
        redemptions: 100,
        redeemedValueCents: 450_000,
        expiresAt: '2026-01-15',
        active: false,
        note: 'Depleted',
    },
    {
        id: 'cpn-4',
        code: 'FREESHIP',
        type: 'free_shipping',
        value: null,
        maxRedemptions: 200,
        redemptions: 67,
        redeemedValueCents: 53_600, // est. shipping saved (mock)
        expiresAt: null,
        active: true,
        note: 'Domestic only',
    },
];

const moneyUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function formatDiscount(c) {
    if (c.type === 'percent') return `${c.value}% off`;
    if (c.type === 'fixed')
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
            (c.valueCents ?? 0) / 100,
        );
    if (c.type === 'free_shipping') return 'Free shipping';
    return '—';
}

export default function CouponsPage() {
    const [query, setQuery] = React.useState('');
    const [filter, setFilter] = React.useState('all');

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        return MOCK_COUPONS.filter((c) => {
            if (filter === 'active' && !c.active) return false;
            if (filter === 'inactive' && c.active) return false;
            if (!q) return true;
            return (
                c.code.toLowerCase().includes(q) ||
                (c.note && c.note.toLowerCase().includes(q)) ||
                c.id.toLowerCase().includes(q)
            );
        });
    }, [filter, query]);

    const activeCount = MOCK_COUPONS.filter((c) => c.active).length;
    const totalRedemptions = MOCK_COUPONS.reduce((s, c) => s + c.redemptions, 0);
    const totalRedemptionValueCents = MOCK_COUPONS.reduce((s, c) => s + (c.redeemedValueCents ?? 0), 0);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-zinc-100 text-xl font-semibold tracking-tight">Coupons</h1>
                <p className="text-zinc-500 mt-1 text-sm">
                    Promo codes for checkout — mock UI only (wire to Stripe / DB later).
                </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Codes (mock)</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-zinc-100">
                                {MOCK_COUPONS.length}
                            </p>
                        </div>
                        <TicketPercent className="mt-0.5 size-4 text-indigo-400/80" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Active</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-emerald-400">{activeCount}</p>
                        </div>
                        <CheckCircle2 className="mt-0.5 size-4 text-emerald-400/80" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Total redemptions</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-zinc-100">
                                {totalRedemptions.toLocaleString()}
                            </p>
                        </div>
                        <Hash className="mt-0.5 size-4 text-zinc-500" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                                Total redemption value
                            </p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-amber-400/95">
                                {moneyUsd.format(totalRedemptionValueCents / 100)}
                            </p>
                            <p className="mt-0.5 text-[10px] text-zinc-600">Discount given (mock)</p>
                        </div>
                        <CircleDollarSign className="mt-0.5 size-4 text-amber-400/80" />
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2 border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                    onClick={() => exportCouponsToCsv(filtered)}
                >
                    <Download className="size-3.5" />
                    Export CSV
                </Button>
            </div>

            <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader className="pb-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-sm text-zinc-100">All coupons</CardTitle>
                            <CardDescription className="text-[10px] text-zinc-500">
                                Code, discount, usage, expiry
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-56">
                            <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search code…"
                                className="h-8 border-zinc-700 bg-zinc-950 pl-7 text-xs text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-1">
                        {['all', 'active', 'inactive'].map((f) => (
                            <button
                                key={f}
                                type="button"
                                onClick={() => setFilter(f)}
                                className={cn(
                                    'rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                                    filter === f
                                        ? 'bg-zinc-700 text-zinc-100'
                                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Code</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Discount</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Uses</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Expires</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Status</TableHead>
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Note</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow className="border-zinc-800">
                                    <TableCell colSpan={6} className="py-8 text-center text-xs text-zinc-500">
                                        No coupons match filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((c) => (
                                    <TableRow key={c.id} className="border-zinc-800/80">
                                        <TableCell className="px-4 py-2">
                                            <span className="font-mono text-[11px] font-medium text-zinc-200">
                                                {c.code}
                                            </span>
                                            <p className="text-[10px] text-zinc-600">{c.id}</p>
                                        </TableCell>
                                        <TableCell className="px-3 py-2 text-[11px] text-zinc-300">
                                            {formatDiscount(c)}
                                        </TableCell>
                                        <TableCell className="px-3 py-2 text-[11px] tabular-nums text-zinc-400">
                                            {c.redemptions.toLocaleString()}
                                            {c.maxRedemptions != null
                                                ? ` / ${c.maxRedemptions.toLocaleString()}`
                                                : ' / ∞'}
                                        </TableCell>
                                        <TableCell className="px-3 py-2 text-[11px] text-zinc-400">
                                            {c.expiresAt ?? '—'}
                                        </TableCell>
                                        <TableCell className="px-3 py-2">
                                            <span
                                                className={cn(
                                                    'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium',
                                                    c.active
                                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                                        : 'border-zinc-600 bg-zinc-800/60 text-zinc-500',
                                                )}
                                            >
                                                {c.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-[220px] px-4 py-2 text-[10px] text-zinc-500">
                                            {c.note}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
