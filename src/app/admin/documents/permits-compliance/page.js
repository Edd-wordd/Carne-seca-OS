'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Search, AlertTriangle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

const MOCK_PERMITS = [
    {
        id: 'pc-1',
        name: 'Texas Food Handler — lead operator',
        category: 'Food handler permit',
        issued: '2024-06-01',
        expires: '2026-05-31',
        daysLeft: 60,
        labelingNotes: '—',
    },
    {
        id: 'pc-2',
        name: 'Cottage Food Production license',
        category: 'Cottage food',
        issued: '2025-01-15',
        expires: '2026-01-14',
        daysLeft: -77,
        labelingNotes: 'Renewal window open',
    },
    {
        id: 'pc-3',
        name: 'Product label review — Original 8oz SKU',
        category: 'Labeling compliance',
        issued: '2025-09-01',
        expires: '—',
        daysLeft: null,
        labelingNotes: 'Ingredients panel v3 approved',
    },
    {
        id: 'pc-4',
        name: 'Co-packer facility letter of continuing guarantee',
        category: 'Labeling compliance',
        issued: '2025-11-10',
        expires: '2026-11-09',
        daysLeft: 223,
        labelingNotes: 'On file with shared kitchen',
    },
    {
        id: 'pc-5',
        name: 'City of El Paso mobile food unit permit',
        category: 'Permit',
        issued: '2025-03-01',
        expires: '2026-02-28',
        daysLeft: 30,
        labelingNotes: 'Truck inspections due yearly',
    },
];

function alertLevel(daysLeft) {
    if (daysLeft == null) return null;
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 30) return 'urgent';
    if (daysLeft <= 90) return 'soon';
    return 'ok';
}

function alertPill(level) {
    switch (level) {
        case 'expired':
            return { label: 'Expired', className: 'border-red-600/50 bg-red-500/15 text-red-300' };
        case 'urgent':
            return { label: '≤30 days', className: 'border-amber-600/50 bg-amber-500/15 text-amber-300' };
        case 'soon':
            return { label: '≤90 days', className: 'border-yellow-600/40 bg-yellow-500/10 text-yellow-200/90' };
        case 'ok':
            return { label: 'OK', className: 'border-zinc-600/50 bg-zinc-800/50 text-zinc-500' };
        default:
            return { label: '—', className: 'border-zinc-700/50 bg-zinc-900/50 text-zinc-600' };
    }
}

export default function DocumentsPermitsCompliancePage() {
    const [search, setSearch] = React.useState('');

    const attention = MOCK_PERMITS.filter((p) => {
        const a = alertLevel(p.daysLeft);
        return a === 'expired' || a === 'urgent';
    });

    const rows = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return MOCK_PERMITS;
        return MOCK_PERMITS.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                r.category.toLowerCase().includes(q) ||
                r.labelingNotes.toLowerCase().includes(q),
        );
    }, [search]);

    return (
        <div className="space-y-4">
            <div className="flex gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/80">
                    <ShieldCheck className="size-4 text-sky-400/90" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-zinc-100">Permits & Compliance</h1>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-500">
                        Food handler permits, cottage food license, labeling compliance, and expiration tracking with
                        alerts (mock). UI only — hook up reminders when wired.
                    </p>
                </div>
            </div>

            {attention.length > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
                    <Bell className="mt-0.5 size-4 shrink-0 text-amber-400" />
                    <div>
                        <p className="text-xs font-medium text-amber-200">
                            {attention.length} item{attention.length !== 1 ? 's' : ''} need attention (mock alerts)
                        </p>
                        <p className="mt-0.5 text-[10px] text-amber-200/70">
                            Expired or expiring within 30 days — renew or update documentation.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid gap-2 sm:grid-cols-4">
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Tracked (mock)</p>
                            <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-100">
                                {MOCK_PERMITS.length}
                            </p>
                        </div>
                        <ShieldCheck className="size-4 text-sky-400/70" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Urgent / expired</p>
                            <p className="mt-0.5 text-lg font-semibold tabular-nums text-red-400">
                                {MOCK_PERMITS.filter((p) => {
                                    const a = alertLevel(p.daysLeft);
                                    return a === 'expired' || a === 'urgent';
                                }).length}
                            </p>
                        </div>
                        <AlertTriangle className="size-4 text-red-400/70" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70 sm:col-span-2">
                    <CardContent className="p-3">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500">Alert rules (placeholder)</p>
                        <p className="mt-1 text-[11px] text-zinc-400">
                            Email + in-app at 90 / 30 / 7 days before expiration; escalate when expired.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader className="space-y-0 pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-sm text-zinc-100">Permits & records</CardTitle>
                            <CardDescription className="text-[10px] text-zinc-500">
                                Expiration dates drive alert badges below
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
                            <Input
                                placeholder="Search name, category, notes…"
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
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Document</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Category</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Issued</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Expires</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Alert</TableHead>
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Compliance notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row) => {
                                const level = alertLevel(row.daysLeft);
                                const pill = alertPill(level);
                                return (
                                    <TableRow key={row.id} className="border-zinc-800/80">
                                        <TableCell className="max-w-[220px] px-4 py-2">
                                            <p className="text-[11px] font-medium text-zinc-200">{row.name}</p>
                                            <p className="font-mono text-[10px] text-zinc-600">{row.id}</p>
                                        </TableCell>
                                        <TableCell className="px-3 py-2 text-[11px] text-zinc-400">{row.category}</TableCell>
                                        <TableCell className="whitespace-nowrap px-3 py-2 text-[11px] text-zinc-400">
                                            {row.issued}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-3 py-2 text-[11px] text-zinc-400">
                                            {row.expires}
                                            {row.daysLeft != null && (
                                                <span className="ml-1 text-[10px] text-zinc-600">
                                                    (
                                                    {row.daysLeft < 0
                                                        ? `${Math.abs(row.daysLeft)}d overdue`
                                                        : `${row.daysLeft}d left`}
                                                    )
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-3 py-2">
                                            <span
                                                className={cn(
                                                    'inline-flex rounded border px-2 py-0.5 text-[10px] font-medium',
                                                    pill.className,
                                                )}
                                            >
                                                {pill.label}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-[240px] px-4 py-2 text-[11px] leading-snug text-zinc-500">
                                            {row.labelingNotes}
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
