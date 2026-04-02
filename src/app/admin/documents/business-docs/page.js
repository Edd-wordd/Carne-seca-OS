'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Building2, Search, Landmark, FileText, Shield } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

const MOCK_BUSINESS_DOCS = [
    {
        id: 'bd-1',
        title: 'Certificate of Formation — LLC',
        category: 'Entity',
        authority: 'Texas Secretary of State',
        effectiveOrFiled: '2021-04-18',
        nextAction: 'Annual franchise report — May',
        status: 'current',
    },
    {
        id: 'bd-2',
        title: 'EIN confirmation letter (CP575)',
        category: 'Tax ID',
        authority: 'IRS',
        effectiveOrFiled: '2021-04-22',
        nextAction: '—',
        status: 'current',
    },
    {
        id: 'bd-3',
        title: 'General liability + product liability policy',
        category: 'Insurance',
        authority: 'Carrier on file',
        effectiveOrFiled: '2025-07-01',
        nextAction: 'Renewal 2026-07-01',
        status: 'current',
    },
    {
        id: 'bd-4',
        title: 'Registered agent designation',
        category: 'Entity',
        authority: 'Texas SOS',
        effectiveOrFiled: '2024-01-10',
        nextAction: 'Verify address yearly',
        status: 'current',
    },
    {
        id: 'bd-5',
        title: 'Operating agreement (member-managed)',
        category: 'Governance',
        authority: 'Internal',
        effectiveOrFiled: '2023-11-01',
        nextAction: 'Amend if ownership changes',
        status: 'current',
    },
    {
        id: 'bd-6',
        title: 'Sales tax permit — Texas',
        category: 'Tax',
        authority: 'Comptroller',
        effectiveOrFiled: '2022-03-05',
        nextAction: 'Quarterly filing reminder',
        status: 'review',
    },
];

function categoryIcon(cat) {
    if (cat === 'Entity' || cat === 'Governance') return Building2;
    if (cat === 'Tax' || cat === 'Tax ID') return Landmark;
    if (cat === 'Insurance') return Shield;
    return FileText;
}

function statusPill(status) {
    switch (status) {
        case 'current':
            return 'border-emerald-600/40 bg-emerald-500/10 text-emerald-300';
        case 'review':
            return 'border-amber-600/40 bg-amber-500/10 text-amber-300';
        case 'missing':
            return 'border-red-600/40 bg-red-500/10 text-red-300';
        default:
            return 'border-zinc-600/50 bg-zinc-800/50 text-zinc-400';
    }
}

export default function DocumentsBusinessDocsPage() {
    const [search, setSearch] = React.useState('');

    const rows = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return MOCK_BUSINESS_DOCS;
        return MOCK_BUSINESS_DOCS.filter(
            (r) =>
                r.title.toLowerCase().includes(q) ||
                r.category.toLowerCase().includes(q) ||
                r.authority.toLowerCase().includes(q) ||
                r.nextAction.toLowerCase().includes(q),
        );
    }, [search]);

    return (
        <div className="space-y-4">
            <div className="flex gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/80">
                    <Building2 className="size-4 text-violet-400/90" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-zinc-100">Business Docs</h1>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-500">
                        LLC filing, EIN, insurance, and everything that keeps the business legally operating. UI only —
                        attach PDFs and owners when wired.
                    </p>
                </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Indexed (mock)</p>
                            <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-100">
                                {MOCK_BUSINESS_DOCS.length}
                            </p>
                        </div>
                        <Building2 className="size-4 text-violet-400/70" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Needs review</p>
                            <p className="mt-0.5 text-lg font-semibold tabular-nums text-amber-400">
                                {MOCK_BUSINESS_DOCS.filter((d) => d.status === 'review').length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="p-3">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500">Vault</p>
                        <p className="mt-1 text-[11px] text-zinc-500">S3 / Drive / Notion — connect later</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader className="space-y-0 pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-sm text-zinc-100">Corporate & legal stack</CardTitle>
                            <CardDescription className="text-[10px] text-zinc-500">
                                Formation, tax, insurance, governance
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
                            <Input
                                placeholder="Search title, category, authority…"
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
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Authority / issuer</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Filed / effective</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Next action</TableHead>
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row) => {
                                const Icon = categoryIcon(row.category);
                                return (
                                    <TableRow key={row.id} className="border-zinc-800/80">
                                        <TableCell className="max-w-[220px] px-4 py-2">
                                            <p className="text-[11px] font-medium text-zinc-200">{row.title}</p>
                                            <p className="font-mono text-[10px] text-zinc-600">{row.id}</p>
                                        </TableCell>
                                        <TableCell className="px-3 py-2">
                                            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                                                <Icon className="size-3 text-zinc-500" />
                                                {row.category}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-3 py-2 text-[11px] text-zinc-400">{row.authority}</TableCell>
                                        <TableCell className="whitespace-nowrap px-3 py-2 text-[11px] text-zinc-400">
                                            {row.effectiveOrFiled}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] px-3 py-2 text-[11px] text-zinc-500">
                                            {row.nextAction}
                                        </TableCell>
                                        <TableCell className="px-4 py-2">
                                            <span
                                                className={cn(
                                                    'inline-flex rounded border px-2 py-0.5 text-[10px] font-medium capitalize',
                                                    statusPill(row.status),
                                                )}
                                            >
                                                {row.status}
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
