'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ChartSpline, Search, Instagram, Facebook, MousePointerClick, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

const PLATFORMS = {
    instagram: { label: 'IG', icon: Instagram, className: 'text-pink-400' },
    facebook: { label: 'FB', icon: Facebook, className: 'text-blue-400' },
};

const MOCK_POST_PERFORMANCE = [
    {
        id: 'pa-1',
        excerpt: 'New batch of Premium Brisket 12oz just landed — limited run',
        platforms: ['instagram', 'facebook'],
        publishedAt: '2026-03-28',
        reach: 8420,
        profileVisits: 312,
        linkClicks: 186,
        siteSessions: 94,
        attributedOrders: 12,
        attributedRevenueCents: 41800,
    },
    {
        id: 'pa-2',
        excerpt: 'Behind the scenes: smokehouse prep at 5am',
        platforms: ['instagram'],
        publishedAt: '2026-03-25',
        reach: 12100,
        profileVisits: 520,
        linkClicks: 98,
        siteSessions: 41,
        attributedOrders: 4,
        attributedRevenueCents: 13200,
    },
    {
        id: 'pa-3',
        excerpt: 'Wholesale partners — April order window open, DM for sheet',
        platforms: ['instagram', 'facebook'],
        publishedAt: '2026-03-22',
        reach: 5340,
        profileVisits: 198,
        linkClicks: 74,
        siteSessions: 28,
        attributedOrders: 7,
        attributedRevenueCents: 28900,
    },
    {
        id: 'pa-4',
        excerpt: 'Weekend pop-up Saturday — sample packs for first 20',
        platforms: ['instagram'],
        publishedAt: '2026-03-18',
        reach: 2890,
        profileVisits: 140,
        linkClicks: 52,
        siteSessions: 19,
        attributedOrders: 2,
        attributedRevenueCents: 5400,
    },
];

function formatCurrency(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format((Number(cents) || 0) / 100);
}

function formatNum(n) {
    return new Intl.NumberFormat('en-US').format(n);
}

export default function SocialAnalyticsPage() {
    const [search, setSearch] = React.useState('');

    const totals = React.useMemo(() => {
        return MOCK_POST_PERFORMANCE.reduce(
            (acc, r) => ({
                reach: acc.reach + r.reach,
                linkClicks: acc.linkClicks + r.linkClicks,
                siteSessions: acc.siteSessions + r.siteSessions,
                orders: acc.orders + r.attributedOrders,
                revenueCents: acc.revenueCents + r.attributedRevenueCents,
            }),
            { reach: 0, linkClicks: 0, siteSessions: 0, orders: 0, revenueCents: 0 },
        );
    }, []);

    const rows = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return MOCK_POST_PERFORMANCE;
        return MOCK_POST_PERFORMANCE.filter((r) => r.excerpt.toLowerCase().includes(q) || r.id.includes(q));
    }, [search]);

    return (
        <div className="space-y-4">
            <div className="flex gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/80">
                    <ChartSpline className="size-4 text-fuchsia-400/90" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-zinc-100">Analytics</h1>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-500">
                        Which posts are actually driving traffic and sales — reach, clicks, sessions, and attributed
                        orders (mock). UI only, no backend.
                    </p>
                </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Reach (mock)</p>
                            <p className="mt-0.5 text-base font-semibold tabular-nums text-zinc-100">
                                {formatNum(totals.reach)}
                            </p>
                        </div>
                        <ChartSpline className="size-4 text-fuchsia-400/70" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Link taps / clicks</p>
                            <p className="mt-0.5 text-base font-semibold tabular-nums text-sky-300">
                                {formatNum(totals.linkClicks)}
                            </p>
                        </div>
                        <MousePointerClick className="size-4 text-sky-400/70" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Site sessions</p>
                            <p className="mt-0.5 text-base font-semibold tabular-nums text-zinc-100">
                                {formatNum(totals.siteSessions)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Attributed orders</p>
                            <p className="mt-0.5 text-base font-semibold tabular-nums text-emerald-400">
                                {formatNum(totals.orders)}
                            </p>
                        </div>
                        <ShoppingBag className="size-4 text-emerald-400/70" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70 sm:col-span-2 lg:col-span-1">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Attributed revenue</p>
                            <p className="mt-0.5 text-base font-semibold tabular-nums text-emerald-400">
                                {formatCurrency(totals.revenueCents)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader className="space-y-0 pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-sm text-zinc-100">By post</CardTitle>
                            <CardDescription className="text-[10px] text-zinc-500">
                                Last-touch or assisted attribution — define in BI when wired
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
                            <Input
                                placeholder="Search post copy…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-8 border-zinc-700 bg-zinc-950 pl-8 text-xs text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Post</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Channels</TableHead>
                                <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">Reach</TableHead>
                                <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">Profile visits</TableHead>
                                <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">Clicks</TableHead>
                                <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">Sessions</TableHead>
                                <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">Orders</TableHead>
                                <TableHead className="h-8 px-4 text-right text-[10px] text-zinc-500">Revenue</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow className="border-zinc-800/80">
                                    <TableCell colSpan={8} className="py-10 text-center text-sm text-zinc-500">
                                        No posts match your search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row) => (
                                    <TableRow key={row.id} className="border-zinc-800/80">
                                        <TableCell className="max-w-[220px] px-4 py-2">
                                            <p className="text-[11px] leading-snug text-zinc-300">{row.excerpt}</p>
                                            <p className="mt-0.5 text-[10px] text-zinc-600">
                                                {row.publishedAt} · {row.id}
                                            </p>
                                        </TableCell>
                                        <TableCell className="px-3 py-2">
                                            <div className="flex flex-wrap gap-1">
                                                {row.platforms.map((p) => {
                                                    const cfg = PLATFORMS[p];
                                                    if (!cfg) return null;
                                                    const Icon = cfg.icon;
                                                    return (
                                                        <span
                                                            key={p}
                                                            className="inline-flex items-center gap-0.5 rounded border border-zinc-700/80 bg-zinc-950/80 px-1 py-0.5 text-[9px] text-zinc-400"
                                                        >
                                                            <Icon className={cn('size-2.5', cfg.className)} />
                                                            {cfg.label}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-3 py-2 text-right text-[11px] tabular-nums text-zinc-300">
                                            {formatNum(row.reach)}
                                        </TableCell>
                                        <TableCell className="px-3 py-2 text-right text-[11px] tabular-nums text-zinc-400">
                                            {formatNum(row.profileVisits)}
                                        </TableCell>
                                        <TableCell className="px-3 py-2 text-right text-[11px] tabular-nums text-sky-400/90">
                                            {formatNum(row.linkClicks)}
                                        </TableCell>
                                        <TableCell className="px-3 py-2 text-right text-[11px] tabular-nums text-zinc-400">
                                            {formatNum(row.siteSessions)}
                                        </TableCell>
                                        <TableCell className="px-3 py-2 text-right text-[11px] font-medium tabular-nums text-emerald-400/90">
                                            {formatNum(row.attributedOrders)}
                                        </TableCell>
                                        <TableCell className="px-4 py-2 text-right text-[11px] font-medium tabular-nums text-emerald-400">
                                            {formatCurrency(row.attributedRevenueCents)}
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
