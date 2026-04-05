'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Mail, MousePointerClick, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

const STATUS_STYLES = {
    sent: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    scheduled: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    draft: 'border-zinc-600 bg-zinc-800/60 text-zinc-400',
};

const MOCK_CAMPAIGNS = [
    {
        id: 'cmp-01',
        name: 'Spring restock — spicy lineup',
        status: 'sent',
        audience: 'Customers · last 90d · 1+ order',
        sentAt: '2026-03-22T10:00',
        recipients: 842,
        openRate: 0.41,
        clickRate: 0.12,
        attributedRevenueCents: 1284000,
    },
    {
        id: 'cmp-02',
        name: 'Abandoned cart — gentle nudge',
        status: 'scheduled',
        audience: 'Cart abandon · 48h window',
        sentAt: null,
        scheduledFor: '2026-04-02T09:00',
        recipients: 0,
        openRate: null,
        clickRate: null,
        attributedRevenueCents: 0,
    },
    {
        id: 'cmp-03',
        name: 'VIP early access — limited batch',
        status: 'draft',
        audience: 'Tag: VIP + min LTV $200',
        sentAt: null,
        scheduledFor: null,
        recipients: 0,
        openRate: null,
        clickRate: null,
        attributedRevenueCents: 0,
    },
];

function formatCurrency(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format((Number(cents) || 0) / 100);
}

function formatWhen(c) {
    if (c.status === 'sent' && c.sentAt) {
        const d = new Date(c.sentAt);
        return isNaN(d.getTime()) ? c.sentAt : d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    }
    if (c.scheduledFor) {
        const d = new Date(c.scheduledFor);
        return isNaN(d.getTime())
            ? c.scheduledFor
            : `Scheduled ${d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`;
    }
    return '—';
}

export default function CampaignsPage() {
    const [query, setQuery] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('all');

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        return MOCK_CAMPAIGNS.filter((c) => {
            if (statusFilter !== 'all' && c.status !== statusFilter) return false;
            if (!q) return true;
            return (
                c.name.toLowerCase().includes(q) ||
                c.audience.toLowerCase().includes(q) ||
                c.id.toLowerCase().includes(q)
            );
        });
    }, [query, statusFilter]);

    const sentCount = MOCK_CAMPAIGNS.filter((c) => c.status === 'sent').length;
    const totalAttributed = MOCK_CAMPAIGNS.reduce((s, c) => s + (c.attributedRevenueCents ?? 0), 0);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-zinc-100 text-xl font-semibold tracking-tight">Campaigns</h1>
                    <p className="text-zinc-500 mt-1 text-sm">
                        Email and outreach tied to your customer directory — mock UI only.
                    </p>
                </div>
                <Button
                    size="sm"
                    disabled
                    className="h-9 gap-1.5 bg-indigo-500/20 text-indigo-300 opacity-60"
                >
                    <Plus className="size-3.5" />
                    New campaign
                </Button>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Campaigns (mock)</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-zinc-100">
                                {MOCK_CAMPAIGNS.length}
                            </p>
                        </div>
                        <Mail className="mt-0.5 size-4 text-zinc-500" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Sent</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-emerald-400">{sentCount}</p>
                        </div>
                        <MousePointerClick className="mt-0.5 size-4 text-emerald-400/80" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Attributed revenue</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-zinc-100">
                                {formatCurrency(totalAttributed)}
                            </p>
                        </div>
                        <DollarSign className="mt-0.5 size-4 text-zinc-400" />
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader className="pb-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-sm text-zinc-100">All campaigns</CardTitle>
                            <CardDescription className="text-[10px] text-zinc-500">
                                Status, audience, and performance (placeholder metrics)
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-56">
                            <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search…"
                                className="h-8 border-zinc-700 bg-zinc-950 pl-7 text-xs text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-1">
                        {['all', 'sent', 'scheduled', 'draft'].map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setStatusFilter(s)}
                                className={cn(
                                    'rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                                    statusFilter === s
                                        ? 'bg-zinc-700 text-zinc-100'
                                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Campaign</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Status</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Audience</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">When</TableHead>
                                <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">Recipients</TableHead>
                                <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">Open</TableHead>
                                <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">Click</TableHead>
                                <TableHead className="h-8 px-4 text-right text-[10px] text-zinc-500">Attributed</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow className="border-zinc-800">
                                    <TableCell colSpan={8} className="py-8 text-center text-xs text-zinc-500">
                                        No campaigns match filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((c) => (
                                    <TableRow key={c.id} className="border-zinc-800/80">
                                        <TableCell className="px-4 py-2">
                                            <p className="text-[11px] font-medium text-zinc-200">{c.name}</p>
                                            <p className="font-mono text-[10px] text-zinc-600">{c.id}</p>
                                        </TableCell>
                                        <TableCell className="px-3 py-2">
                                            <span
                                                className={cn(
                                                    'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
                                                    STATUS_STYLES[c.status] ?? STATUS_STYLES.draft,
                                                )}
                                            >
                                                {c.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] px-3 py-2 text-[10px] text-zinc-400">
                                            {c.audience}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-3 py-2 text-[10px] text-zinc-400">
                                            {formatWhen(c)}
                                        </TableCell>
                                        <TableCell className="px-3 py-2 text-right text-[11px] tabular-nums text-zinc-400">
                                            {c.recipients > 0 ? c.recipients.toLocaleString() : '—'}
                                        </TableCell>
                                        <TableCell className="px-3 py-2 text-right text-[11px] tabular-nums text-zinc-400">
                                            {c.openRate != null ? `${Math.round(c.openRate * 100)}%` : '—'}
                                        </TableCell>
                                        <TableCell className="px-3 py-2 text-right text-[11px] tabular-nums text-zinc-400">
                                            {c.clickRate != null ? `${Math.round(c.clickRate * 100)}%` : '—'}
                                        </TableCell>
                                        <TableCell className="px-4 py-2 text-right text-[11px] font-medium tabular-nums text-emerald-400">
                                            {c.attributedRevenueCents > 0
                                                ? formatCurrency(c.attributedRevenueCents)
                                                : '—'}
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
