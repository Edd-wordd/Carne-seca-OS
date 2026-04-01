'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, Percent } from 'lucide-react';

const MOCK_EVENT_ROI = [
    {
        id: 'roi-1',
        eventName: 'Trail of Lights pop-up',
        date: '2025-12-14',
        revenueCents: 557000,
        costsCents: 142000,
        costNotes: 'Booth, ice, travel',
    },
    {
        id: 'roi-2',
        eventName: "SFC Farmers' Market — Mueller",
        date: '2025-11-02',
        revenueCents: 248000,
        costsCents: 95000,
        costNotes: 'Stall fee, tent, samples',
    },
    {
        id: 'roi-3',
        eventName: 'Night Market — Eastside',
        date: '2025-10-18',
        revenueCents: 189000,
        costsCents: 118000,
        costNotes: 'Vendor fee, labor',
    },
];

function formatCurrency(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format((Number(cents) || 0) / 100);
}

function netCents(row) {
    return row.revenueCents - row.costsCents;
}

function roiPercent(row) {
    if (!row.costsCents) return null;
    return ((row.revenueCents - row.costsCents) / row.costsCents) * 100;
}

function formatRoiPct(pct) {
    if (pct == null || Number.isNaN(pct)) return '—';
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(0)}%`;
}

export default function EventsRoiPage() {
    const totalRev = MOCK_EVENT_ROI.reduce((s, r) => s + r.revenueCents, 0);
    const totalCost = MOCK_EVENT_ROI.reduce((s, r) => s + r.costsCents, 0);
    const blendedRoi = totalCost ? ((totalRev - totalCost) / totalCost) * 100 : null;
    const best = MOCK_EVENT_ROI.reduce(
        (a, r) => (roiPercent(r) > roiPercent(a) ? r : a),
        MOCK_EVENT_ROI[0],
    );

    return (
        <div className="space-y-6">
            <div className="flex gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/80">
                    <TrendingUp className="size-4 text-emerald-400/90" />
                </div>
                <div>
                    <h1 className="text-zinc-100 text-xl font-semibold tracking-tight">ROI</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
                        Stack your sales log revenue against booth fees, travel, samples, and labor so you can see which
                        markets and pop-ups actually pay off. Mock numbers — wire from sales log and expenses later.
                    </p>
                    <p className="text-zinc-500 mt-2 text-sm">Mock UI only.</p>
                </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Event revenue (mock)</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-emerald-400">
                                {formatCurrency(totalRev)}
                            </p>
                        </div>
                        <DollarSign className="mt-0.5 size-4 text-emerald-400/80" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Costs allocated</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-zinc-100">
                                {formatCurrency(totalCost)}
                            </p>
                        </div>
                        <DollarSign className="mt-0.5 size-4 text-amber-400/80" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Blended ROI</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-indigo-300">
                                {formatRoiPct(blendedRoi)}
                            </p>
                        </div>
                        <Percent className="mt-0.5 size-4 text-indigo-400/80" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Top performer (mock)</p>
                            <p className="mt-1 line-clamp-2 text-xs font-medium leading-snug text-zinc-200">
                                {best?.eventName ?? '—'}
                            </p>
                        </div>
                        <TrendingUp className="mt-0.5 size-4 shrink-0 text-emerald-400/80" />
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-zinc-100">By event</CardTitle>
                    <CardDescription className="text-[10px] text-zinc-500">
                        Net = revenue − costs · ROI = net ÷ costs
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Event</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Date</TableHead>
                                <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">Revenue</TableHead>
                                <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">Costs</TableHead>
                                <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">Net</TableHead>
                                <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">ROI</TableHead>
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Cost notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {MOCK_EVENT_ROI.map((row) => {
                                const net = netCents(row);
                                const roi = roiPercent(row);
                                return (
                                    <TableRow key={row.id} className="border-zinc-800/80">
                                        <TableCell className="px-4 py-2 text-[11px] font-medium text-zinc-200">
                                            {row.eventName}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-3 py-2 text-[11px] text-zinc-400">
                                            {row.date}
                                        </TableCell>
                                        <TableCell className="px-3 py-2 text-right text-[11px] font-medium tabular-nums text-emerald-400">
                                            {formatCurrency(row.revenueCents)}
                                        </TableCell>
                                        <TableCell className="px-3 py-2 text-right text-[11px] tabular-nums text-zinc-400">
                                            {formatCurrency(row.costsCents)}
                                        </TableCell>
                                        <TableCell
                                            className={`px-3 py-2 text-right text-[11px] font-medium tabular-nums ${net >= 0 ? 'text-emerald-400/90' : 'text-red-400/90'}`}
                                        >
                                            {formatCurrency(net)}
                                        </TableCell>
                                        <TableCell
                                            className={`px-3 py-2 text-right text-[11px] font-medium tabular-nums ${roi != null && roi >= 0 ? 'text-indigo-300' : 'text-red-400/80'}`}
                                        >
                                            {formatRoiPct(roi)}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] px-4 py-2 text-[10px] text-zinc-500">
                                            {row.costNotes}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
