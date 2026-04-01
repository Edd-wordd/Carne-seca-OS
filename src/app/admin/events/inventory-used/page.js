'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Boxes, Package } from 'lucide-react';

const MOCK_INVENTORY_USED = [
    {
        id: 'iu-1',
        eventName: 'Trail of Lights pop-up',
        date: '2025-12-14',
        sku: 'CS-8OZ-ORIG',
        product: 'Original 8oz',
        qtyOut: 120,
        qtyReturned: 8,
        notes: 'End-of-night count',
    },
    {
        id: 'iu-2',
        eventName: 'Trail of Lights pop-up',
        date: '2025-12-14',
        sku: 'CS-GIFT-TRIO',
        product: 'Gift trio bundle',
        qtyOut: 45,
        qtyReturned: 3,
        notes: '',
    },
    {
        id: 'iu-3',
        eventName: "SFC Farmers' Market — Mueller",
        date: '2025-11-02',
        sku: 'CS-4OZ-SPIC',
        product: 'Spicy 4oz',
        qtyOut: 90,
        qtyReturned: 22,
        notes: 'Rain — pulled early',
    },
    {
        id: 'iu-4',
        eventName: 'Night Market — Eastside',
        date: '2025-10-18',
        sku: 'CS-8OZ-ORIG',
        product: 'Original 8oz',
        qtyOut: 64,
        qtyReturned: 0,
        notes: 'Sold through',
    },
];

export default function EventsInventoryUsedPage() {
    const eventKeys = new Set(MOCK_INVENTORY_USED.map((r) => `${r.eventName}|${r.date}`)).size;
    const totalOut = MOCK_INVENTORY_USED.reduce((s, r) => s + r.qtyOut, 0);
    const totalRet = MOCK_INVENTORY_USED.reduce((s, r) => s + r.qtyReturned, 0);
    const bySku = MOCK_INVENTORY_USED.reduce((acc, r) => {
        acc[r.sku] = (acc[r.sku] || 0) + r.qtyOut;
        return acc;
    }, {});
    const topSku = Object.entries(bySku).sort((a, b) => b[1] - a[1])[0];
    const topLabel = topSku ? `${topSku[0]} (${topSku[1]} out)` : '—';

    return (
        <div className="space-y-6">
            <div className="flex gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/80">
                    <Boxes className="size-4 text-sky-400/90" />
                </div>
                <div>
                    <h1 className="text-zinc-100 text-xl font-semibold tracking-tight">Inventory Used</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
                        Record what you took out of stock for each market or pop-up: units packed out, what came back
                        unsold, and tie-ins to your main inventory later.
                    </p>
                    <p className="text-zinc-500 mt-2 text-sm">Mock UI only.</p>
                </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Events (mock)</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-zinc-100">{eventKeys}</p>
                        </div>
                        <Package className="mt-0.5 size-4 text-amber-400/80" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Units out</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-zinc-100">{totalOut}</p>
                        </div>
                        <Boxes className="mt-0.5 size-4 text-sky-400/80" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Returned unsold</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-zinc-400">{totalRet}</p>
                        </div>
                        <Boxes className="mt-0.5 size-4 text-zinc-500" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Top SKU by units out</p>
                            <p className="mt-1 font-mono text-xs font-medium leading-snug text-zinc-200">{topLabel}</p>
                        </div>
                        <Package className="mt-0.5 size-4 shrink-0 text-indigo-400/80" />
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-zinc-100">Lines</CardTitle>
                    <CardDescription className="text-[10px] text-zinc-500">
                        One row per event × SKU — link to catalog SKUs when wired
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Event</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Date</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">SKU</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Product</TableHead>
                                <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">Out</TableHead>
                                <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">Returned</TableHead>
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {MOCK_INVENTORY_USED.map((row) => (
                                <TableRow key={row.id} className="border-zinc-800/80">
                                    <TableCell className="px-4 py-2 text-[11px] font-medium text-zinc-200">
                                        {row.eventName}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap px-3 py-2 text-[11px] text-zinc-400">
                                        {row.date}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 font-mono text-[11px] text-zinc-400">{row.sku}</TableCell>
                                    <TableCell className="px-3 py-2 text-[11px] text-zinc-300">{row.product}</TableCell>
                                    <TableCell className="px-3 py-2 text-right text-[11px] font-medium tabular-nums text-zinc-100">
                                        {row.qtyOut}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-right text-[11px] tabular-nums text-zinc-400">
                                        {row.qtyReturned}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] px-4 py-2 text-[10px] text-zinc-500">
                                        {row.notes || '—'}
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
