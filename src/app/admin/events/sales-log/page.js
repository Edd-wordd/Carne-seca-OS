'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardList, DollarSign } from 'lucide-react';

const MOCK_SALES_LOG = [
    {
        id: 'sl-1',
        eventName: 'Trail of Lights pop-up',
        date: '2025-12-14',
        whatSold: 'Gift bundles, 8oz bags, singles — 156 units',
        cashCents: 392000,
        samples: 48,
        notes: 'Strong gift bundles',
    },
    {
        id: 'sl-2',
        eventName: "SFC Farmers' Market — Mueller",
        date: '2025-11-02',
        whatSold: 'Mostly 4oz + samples converted — 71 units',
        cashCents: 165000,
        samples: 120,
        notes: 'Rain cut short',
    },
];

function formatCurrency(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format((Number(cents) || 0) / 100);
}

export default function EventsSalesLogPage() {
    return (
        <div className="space-y-6">
            <div className="flex gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/80">
                    <ClipboardList className="size-4 text-amber-400/90" />
                </div>
                <div>
                    <h1 className="text-zinc-100 text-xl font-semibold tracking-tight">Sales Log</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
                        This is not &ldquo;sales per event.&rdquo; You won&apos;t know that until after the day is
                        over. The Sales Log is what you fill out afterward: what you sold, how much cash came in, and
                        how many samples you gave out.
                    </p>
                    <p className="text-zinc-500 mt-2 text-sm">Mock UI only.</p>
                </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Log entries</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-zinc-100">
                                {MOCK_SALES_LOG.length}
                            </p>
                        </div>
                        <ClipboardList className="mt-0.5 size-4 text-amber-400/80" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Cash in (logged)</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-emerald-400">
                                {formatCurrency(MOCK_SALES_LOG.reduce((s, x) => s + x.cashCents, 0))}
                            </p>
                        </div>
                        <DollarSign className="mt-0.5 size-4 text-emerald-400/80" />
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-zinc-100">Entries</CardTitle>
                    <CardDescription className="text-[10px] text-zinc-500">
                        Mock rows — wire from form / POS later
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Event</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Date</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">What you sold</TableHead>
                                <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">Cash in</TableHead>
                                <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">Samples</TableHead>
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {MOCK_SALES_LOG.map((row) => (
                                <TableRow key={row.id} className="border-zinc-800/80">
                                    <TableCell className="px-4 py-2 text-[11px] font-medium text-zinc-200">
                                        {row.eventName}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap px-3 py-2 text-[11px] text-zinc-400">
                                        {row.date}
                                    </TableCell>
                                    <TableCell className="max-w-[220px] px-3 py-2 text-[11px] text-zinc-400">
                                        {row.whatSold}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-right text-[11px] font-medium tabular-nums text-emerald-400">
                                        {formatCurrency(row.cashCents)}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-right text-[11px] tabular-nums text-zinc-400">
                                        {row.samples}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] px-4 py-2 text-[10px] text-zinc-500">
                                        {row.notes}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
