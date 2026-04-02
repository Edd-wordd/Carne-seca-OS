'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

const STAGES = [
    { value: 'combed_through', label: 'Combed through' },
    { value: 'validated', label: 'Validated' },
    { value: 'ready_to_contact', label: 'Ready to contact' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'converted', label: 'Converted' },
    { value: 'lost', label: 'Lost' },
];

const MOCK_PIPELINE = [
    {
        id: 'p-1',
        name: 'Maria Chen',
        company: 'Texas BBQ House',
        stage: 'ready_to_contact',
        lastContact: 'Feb 18 · Validated, no outreach yet',
        nextAction: 'Send intro email (wholesale)',
    },
    {
        id: 'p-2',
        name: 'James Rodriguez',
        company: 'Houston Smokehouse',
        stage: 'ready_to_contact',
        lastContact: 'Feb 17 · Lead qualified internally',
        nextAction: 'Schedule discovery call',
    },
    {
        id: 'p-3',
        name: 'Sarah Kim',
        company: 'Farm & Table SA',
        stage: 'validated',
        lastContact: 'Feb 18 · AI review complete',
        nextAction: 'Assign owner & first touch',
    },
    {
        id: 'p-4',
        name: 'David Park',
        company: '—',
        stage: 'combed_through',
        lastContact: 'Feb 18 · Imported from trade show',
        nextAction: 'Validate email + company',
    },
    {
        id: 'p-5',
        name: 'Lisa Thompson',
        company: 'Uptown Meats Dallas',
        stage: 'contacted',
        lastContact: 'Feb 18 · Intro email sent',
        nextAction: 'Follow up Feb 25 if no reply',
    },
    {
        id: 'p-6',
        name: 'Robert Martinez',
        company: '—',
        stage: 'combed_through',
        lastContact: 'Feb 18 · Ingested from LinkedIn',
        nextAction: 'Run comb / enrichment',
    },
];

function stageLabel(value) {
    return STAGES.find((s) => s.value === value)?.label ?? value;
}

function stagePillClass(value) {
    switch (value) {
        case 'combed_through':
            return 'border-zinc-600/50 bg-zinc-800/50 text-zinc-400';
        case 'validated':
            return 'border-indigo-600/50 bg-indigo-500/10 text-indigo-400';
        case 'ready_to_contact':
            return 'border-emerald-600/50 bg-emerald-500/10 text-emerald-400';
        case 'contacted':
            return 'border-amber-600/50 bg-amber-500/10 text-amber-400';
        case 'qualified':
            return 'border-blue-600/50 bg-blue-500/10 text-blue-400';
        case 'converted':
            return 'border-emerald-700/50 bg-emerald-600/20 text-emerald-300';
        case 'lost':
            return 'border-red-600/50 bg-red-500/10 text-red-400';
        default:
            return 'border-zinc-600/50 bg-zinc-800/50 text-zinc-400';
    }
}

export default function LeadsPipelinePage() {
    const [search, setSearch] = React.useState('');

    const rows = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return MOCK_PIPELINE;
        return MOCK_PIPELINE.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                (r.company && r.company.toLowerCase().includes(q)) ||
                stageLabel(r.stage).toLowerCase().includes(q) ||
                r.nextAction.toLowerCase().includes(q),
        );
    }, [search]);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-lg font-semibold tracking-tight text-zinc-100">Pipeline</h1>
                <p className="mt-0.5 text-xs text-zinc-500">
                    Every prospect, stage, last contact, and next action. UI only — no backend.
                </p>
            </div>

            <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader className="space-y-0 pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-sm text-zinc-100">Prospects</CardTitle>
                            <CardDescription className="text-[10px] text-zinc-500">
                                {MOCK_PIPELINE.length} mock rows · wire to CRM / leads later
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
                            <Input
                                placeholder="Search prospects…"
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
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Prospect</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Stage</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Last contact</TableHead>
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Next action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow className="border-zinc-800/80">
                                    <TableCell colSpan={4} className="py-10 text-center text-sm text-zinc-500">
                                        No prospects match your search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row) => (
                                    <TableRow key={row.id} className="border-zinc-800/80">
                                        <TableCell className="px-4 py-2">
                                            <p className="text-[11px] font-medium text-zinc-200">{row.name}</p>
                                            <p className="text-[10px] text-zinc-500">{row.company}</p>
                                        </TableCell>
                                        <TableCell className="px-3 py-2">
                                            <span
                                                className={cn(
                                                    'inline-flex rounded border px-2 py-0.5 text-[10px] font-medium',
                                                    stagePillClass(row.stage),
                                                )}
                                            >
                                                {stageLabel(row.stage)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-[240px] px-3 py-2 text-[11px] leading-snug text-zinc-400">
                                            {row.lastContact}
                                        </TableCell>
                                        <TableCell className="max-w-[260px] px-4 py-2 text-[11px] leading-snug text-zinc-300">
                                            {row.nextAction}
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
