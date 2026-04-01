'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

/** Mock balances + payout history (UI only, no DB). */
const MOCK_PROMOTERS = [
    {
        id: 'pr-1',
        name: 'Maria Santos',
        email: 'maria.s@email.com',
        owedCents: 42000,
        lastPayoutDate: '2026-02-15',
        lastPayoutCents: 31800,
        nextDueHint: '2026-04-01',
    },
    {
        id: 'pr-2',
        name: 'James Okonkwo',
        email: 'j.okonkwo@email.com',
        owedCents: 0,
        lastPayoutDate: '2026-03-20',
        lastPayoutCents: 12450,
        nextDueHint: '—',
    },
    {
        id: 'pr-3',
        name: 'Downtown Provisions (consignment)',
        email: 'accounts@dtprovisions.com',
        owedCents: 18750,
        lastPayoutDate: '2026-01-28',
        lastPayoutCents: 22100,
        nextDueHint: '2026-03-31',
    },
    {
        id: 'pr-4',
        name: 'Austin Night Market booth',
        email: 'nightmarket@example.com',
        owedCents: 5600,
        lastPayoutDate: null,
        lastPayoutCents: null,
        nextDueHint: 'First payout',
    },
];

const MOCK_PAYOUT_HISTORY = [
    { id: 'pay-104', promoter: 'Maria Santos', date: '2026-02-15', amountCents: 31800, method: 'ACH' },
    { id: 'pay-103', promoter: 'James Okonkwo', date: '2026-03-20', amountCents: 12450, method: 'ACH' },
    { id: 'pay-102', promoter: 'Downtown Provisions (consignment)', date: '2026-01-28', amountCents: 22100, method: 'Check' },
    { id: 'pay-101', promoter: 'Maria Santos', date: '2026-01-10', amountCents: 28900, method: 'ACH' },
];

function formatCurrency(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format((Number(cents) || 0) / 100);
}

export default function PayoutsPage() {
    const [query, setQuery] = React.useState('');
    const [filter, setFilter] = React.useState('all');

    const filteredPromoters = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        return MOCK_PROMOTERS.filter((p) => {
            if (filter === 'owed' && p.owedCents <= 0) return false;
            if (!q) return true;
            return (
                p.name.toLowerCase().includes(q) ||
                p.email.toLowerCase().includes(q) ||
                p.id.toLowerCase().includes(q)
            );
        });
    }, [filter, query]);

    const totalOwed = React.useMemo(
        () => MOCK_PROMOTERS.reduce((s, p) => s + Math.max(0, p.owedCents), 0),
        [],
    );
    const owedCount = MOCK_PROMOTERS.filter((p) => p.owedCents > 0).length;
    const paidLast30Cents = MOCK_PAYOUT_HISTORY.filter((h) => {
        const t = new Date(h.date).getTime();
        const cutoff = Date.parse('2026-03-01');
        return t >= cutoff;
    }).reduce((s, h) => s + h.amountCents, 0);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-zinc-100 text-xl font-semibold tracking-tight">Promoters / Payouts</h1>
                    <p className="text-zinc-500 mt-1 text-sm">
                        Who you owe, how much, and when you last paid them. Mock UI only.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800"
                >
                    <Download className="size-4" />
                    Export CSV
                </Button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Total owed</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-amber-400">
                                {formatCurrency(totalOwed)}
                            </p>
                        </div>
                        <AlertCircle className="mt-0.5 size-4 text-amber-400" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">With balance</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-zinc-100">{owedCount}</p>
                        </div>
                        <Users className="mt-0.5 size-4 text-zinc-400" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Paid (mock Mar+)</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-emerald-400">
                                {formatCurrency(paidLast30Cents)}
                            </p>
                        </div>
                        <CheckCircle2 className="mt-0.5 size-4 text-emerald-400" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="p-4">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500">Promoters tracked</p>
                        <p className="mt-1 text-base font-semibold tabular-nums text-zinc-100">
                            {MOCK_PROMOTERS.length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
                <Card className="border-zinc-800 bg-zinc-900/70 lg:col-span-2">
                    <CardHeader className="pb-2">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-sm text-zinc-100">Balances</CardTitle>
                                <CardDescription className="text-[10px] text-zinc-500">
                                    Outstanding vs last payout
                                </CardDescription>
                            </div>
                            <div className="relative w-full sm:w-56">
                                <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                                <Input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search name or email…"
                                    className="h-8 border-zinc-700 bg-zinc-950 pl-7 text-xs text-zinc-100 placeholder:text-zinc-500"
                                />
                            </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-1">
                            {[
                                { value: 'all', label: 'All' },
                                { value: 'owed', label: 'Owed' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setFilter(opt.value)}
                                    className={cn(
                                        'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                        filter === opt.value
                                            ? 'bg-zinc-700 text-zinc-100'
                                            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800 hover:bg-transparent">
                                    <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Promoter</TableHead>
                                    <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">Owed</TableHead>
                                    <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Last paid</TableHead>
                                    <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">
                                        Last amount
                                    </TableHead>
                                    <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Note</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPromoters.length === 0 ? (
                                    <TableRow className="border-zinc-800/70">
                                        <TableCell colSpan={5} className="py-6 text-center text-xs text-zinc-500">
                                            No promoters match this filter.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPromoters.map((p) => (
                                        <TableRow key={p.id} className="border-zinc-800/70">
                                            <TableCell className="px-3 py-2">
                                                <p className="text-[11px] font-medium text-zinc-200">{p.name}</p>
                                                <p className="text-[10px] text-zinc-500">{p.email}</p>
                                            </TableCell>
                                            <TableCell
                                                className={cn(
                                                    'px-3 py-2 text-right text-[11px] font-medium tabular-nums',
                                                    p.owedCents > 0 ? 'text-amber-400' : 'text-zinc-500',
                                                )}
                                            >
                                                {formatCurrency(p.owedCents)}
                                            </TableCell>
                                            <TableCell className="px-3 py-2 text-[11px] text-zinc-400">
                                                {p.lastPayoutDate ?? '—'}
                                            </TableCell>
                                            <TableCell className="px-3 py-2 text-right text-[11px] tabular-nums text-zinc-300">
                                                {p.lastPayoutCents != null ? formatCurrency(p.lastPayoutCents) : '—'}
                                            </TableCell>
                                            <TableCell className="px-3 py-2 text-[10px] text-zinc-500">
                                                {p.nextDueHint}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-zinc-100">Recent payouts</CardTitle>
                        <CardDescription className="text-[10px] text-zinc-500">When money went out</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {MOCK_PAYOUT_HISTORY.map((h) => (
                            <div
                                key={h.id}
                                className="rounded border border-zinc-800 bg-zinc-950/40 px-3 py-2.5"
                            >
                                <p className="text-[11px] font-medium text-zinc-200">{h.promoter}</p>
                                <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-zinc-500">
                                    <span>{h.date}</span>
                                    <span className="text-zinc-400">{h.method}</span>
                                </div>
                                <p className="mt-1 text-sm font-semibold tabular-nums text-emerald-400">
                                    {formatCurrency(h.amountCents)}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
