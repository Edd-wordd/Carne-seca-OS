'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { FileSignature, Search, Handshake, Truck } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

const MOCK_CONTRACTS = [
    {
        id: 'c-1',
        title: 'Wholesale distribution agreement',
        kind: 'partner',
        party: 'Hill Country Provisions Co.',
        signedAt: '2025-08-12',
        renewsOrEnds: '2027-08-11',
        status: 'active',
        notes: 'Net 30 · minimum case pack',
    },
    {
        id: 'c-2',
        title: 'Beef trim supply — YTD pricing',
        kind: 'supplier',
        party: 'West Texas Packing LLC',
        signedAt: '2026-01-05',
        renewsOrEnds: '2026-12-31',
        status: 'active',
        notes: 'Quarterly price review',
    },
    {
        id: 'c-3',
        title: 'Co-packer / kitchen access addendum',
        kind: 'partner',
        party: 'El Paso Shared Kitchen',
        signedAt: '2024-11-20',
        renewsOrEnds: '2025-11-19',
        status: 'renewal_due',
        notes: 'Renewal discussion Q3',
    },
    {
        id: 'c-4',
        title: 'Label & artwork license',
        kind: 'supplier',
        party: 'Studio Norte LLC',
        signedAt: '2025-03-01',
        renewsOrEnds: 'Perpetual',
        status: 'active',
        notes: 'Logo + packaging files',
    },
];

function kindIcon(k) {
    return k === 'partner' ? Handshake : Truck;
}

function statusPill(status) {
    switch (status) {
        case 'active':
            return 'border-emerald-600/40 bg-emerald-500/10 text-emerald-300';
        case 'renewal_due':
            return 'border-amber-600/40 bg-amber-500/10 text-amber-300';
        case 'expired':
            return 'border-red-600/40 bg-red-500/10 text-red-300';
        default:
            return 'border-zinc-600/50 bg-zinc-800/50 text-zinc-400';
    }
}

export default function DocumentsContractsPage() {
    const [search, setSearch] = React.useState('');

    const rows = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return MOCK_CONTRACTS;
        return MOCK_CONTRACTS.filter(
            (r) =>
                r.title.toLowerCase().includes(q) ||
                r.party.toLowerCase().includes(q) ||
                r.notes.toLowerCase().includes(q),
        );
    }, [search]);

    const renewalDue = MOCK_CONTRACTS.filter((c) => c.status === 'renewal_due').length;

    return (
        <div className="space-y-4">
            <div className="flex gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/80">
                    <FileSignature className="size-4 text-amber-400/90" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-zinc-100">Contracts</h1>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-500">
                        Partner agreements, supplier contracts, and any signed deals. UI only — store files & metadata in
                        your stack later.
                    </p>
                </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">On file (mock)</p>
                            <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-100">
                                {MOCK_CONTRACTS.length}
                            </p>
                        </div>
                        <FileSignature className="size-4 text-amber-400/70" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Active</p>
                            <p className="mt-0.5 text-lg font-semibold tabular-nums text-emerald-400">
                                {MOCK_CONTRACTS.filter((c) => c.status === 'active').length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Renewal attention</p>
                            <p className="mt-0.5 text-lg font-semibold tabular-nums text-amber-400">{renewalDue}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader className="space-y-0 pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-sm text-zinc-100">Agreements</CardTitle>
                            <CardDescription className="text-[10px] text-zinc-500">
                                Signed deals and counterparties
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
                            <Input
                                placeholder="Search title, party, notes…"
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
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Agreement</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Type</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Party</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Signed</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Renews / ends</TableHead>
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row) => {
                                const Icon = kindIcon(row.kind);
                                return (
                                    <TableRow key={row.id} className="border-zinc-800/80">
                                        <TableCell className="max-w-[200px] px-4 py-2">
                                            <p className="text-[11px] font-medium text-zinc-200">{row.title}</p>
                                            <p className="text-[10px] text-zinc-600">{row.notes}</p>
                                        </TableCell>
                                        <TableCell className="px-3 py-2">
                                            <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400">
                                                <Icon className="size-3 text-zinc-500" />
                                                {row.kind === 'partner' ? 'Partner' : 'Supplier'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-3 py-2 text-[11px] text-zinc-300">{row.party}</TableCell>
                                        <TableCell className="whitespace-nowrap px-3 py-2 text-[11px] text-zinc-400">
                                            {row.signedAt}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-3 py-2 text-[11px] text-zinc-400">
                                            {row.renewsOrEnds}
                                        </TableCell>
                                        <TableCell className="px-4 py-2">
                                            <span
                                                className={cn(
                                                    'inline-flex rounded border px-2 py-0.5 text-[10px] font-medium capitalize',
                                                    statusPill(row.status),
                                                )}
                                            >
                                                {row.status.replace('_', ' ')}
                                            </span>
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
