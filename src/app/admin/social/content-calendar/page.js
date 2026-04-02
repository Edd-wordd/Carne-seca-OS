'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalendarRange, Search, Instagram, Facebook, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

const PLATFORMS = {
    instagram: { label: 'Instagram', icon: Instagram, className: 'text-pink-400' },
    facebook: { label: 'Facebook', icon: Facebook, className: 'text-blue-400' },
};

const MOCK_SCHEDULE = [
    {
        id: 'cc-1',
        date: '2026-04-02',
        time: '10:00 AM',
        platforms: ['instagram', 'facebook'],
        title: 'Restock drop — Original 8oz back in stock',
        format: 'Feed + story',
        status: 'scheduled',
    },
    {
        id: 'cc-2',
        date: '2026-04-04',
        time: '6:00 PM',
        platforms: ['instagram'],
        title: 'Weekend market prep — booth B12 Saturday',
        format: 'Reel',
        status: 'draft',
    },
    {
        id: 'cc-3',
        date: '2026-04-05',
        time: '9:00 AM',
        platforms: ['instagram', 'facebook'],
        title: 'SFC Downtown — live from the booth',
        format: 'Stories',
        status: 'scheduled',
    },
    {
        id: 'cc-4',
        date: '2026-04-08',
        time: '12:00 PM',
        platforms: ['facebook'],
        title: 'Wholesale FAQ — how to order for your shop',
        format: 'Post + link',
        status: 'draft',
    },
    {
        id: 'cc-5',
        date: '2026-04-11',
        time: '4:00 PM',
        platforms: ['instagram'],
        title: 'Spicy batch teaser — limited run',
        format: 'Carousel',
        status: 'idea',
    },
    {
        id: 'cc-6',
        date: '2026-04-14',
        time: '11:00 AM',
        platforms: ['instagram', 'facebook'],
        title: 'Customer shout-out / UGC repost',
        format: 'Feed',
        status: 'scheduled',
    },
];

function statusStyle(status) {
    switch (status) {
        case 'scheduled':
            return 'border-emerald-600/40 bg-emerald-500/10 text-emerald-300';
        case 'draft':
            return 'border-amber-600/40 bg-amber-500/10 text-amber-300';
        case 'idea':
            return 'border-zinc-600/50 bg-zinc-800/50 text-zinc-400';
        case 'published':
            return 'border-sky-600/40 bg-sky-500/10 text-sky-300';
        default:
            return 'border-zinc-600/50 bg-zinc-800/50 text-zinc-400';
    }
}

function formatShortDate(iso) {
    const d = new Date(`${iso}T12:00:00`);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function SocialContentCalendarPage() {
    const [search, setSearch] = React.useState('');

    const sorted = React.useMemo(
        () => [...MOCK_SCHEDULE].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
        [],
    );

    const rows = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return sorted;
        return sorted.filter(
            (r) =>
                r.title.toLowerCase().includes(q) ||
                r.format.toLowerCase().includes(q) ||
                r.status.includes(q) ||
                r.date.includes(q) ||
                r.platforms.some((p) => PLATFORMS[p]?.label.toLowerCase().includes(q)),
        );
    }, [search, sorted]);

    const scheduled = MOCK_SCHEDULE.filter((r) => r.status === 'scheduled').length;
    const drafts = MOCK_SCHEDULE.filter((r) => r.status === 'draft').length;
    const ideas = MOCK_SCHEDULE.filter((r) => r.status === 'idea').length;

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/80">
                        <CalendarRange className="size-4 text-violet-400/90" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight text-zinc-100">Content Calendar</h1>
                        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-500">
                            Plan what&apos;s going out and when — channels, format, and status at a glance. UI only, no
                            backend.
                        </p>
                    </div>
                </div>
                <Button
                    size="sm"
                    disabled
                    className="h-9 shrink-0 gap-1.5 bg-indigo-500/20 text-indigo-300 opacity-60"
                >
                    <Plus className="size-3.5" />
                    Add slot
                </Button>
            </div>

            <div className="grid gap-2 sm:grid-cols-4">
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Planned (mock)</p>
                            <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-100">
                                {MOCK_SCHEDULE.length}
                            </p>
                        </div>
                        <CalendarRange className="size-4 text-violet-400/70" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Scheduled</p>
                            <p className="mt-0.5 text-lg font-semibold tabular-nums text-emerald-400">{scheduled}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Drafts</p>
                            <p className="mt-0.5 text-lg font-semibold tabular-nums text-amber-400">{drafts}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Ideas</p>
                            <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-400">{ideas}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader className="space-y-0 pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-sm text-zinc-100">Schedule</CardTitle>
                            <CardDescription className="text-[10px] text-zinc-500">
                                Sorted by date — wire to CMS / Meta later
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
                            <Input
                                placeholder="Search posts, format, status…"
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
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">When</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Channels</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">What&apos;s going out</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Format</TableHead>
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow className="border-zinc-800/80">
                                    <TableCell colSpan={5} className="py-10 text-center text-sm text-zinc-500">
                                        Nothing matches your search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row) => (
                                    <TableRow key={row.id} className="border-zinc-800/80">
                                        <TableCell className="whitespace-nowrap px-4 py-2">
                                            <p className="text-[11px] font-medium text-zinc-200">
                                                {formatShortDate(row.date)}
                                            </p>
                                            <p className="text-[10px] text-zinc-500">{row.time}</p>
                                        </TableCell>
                                        <TableCell className="px-3 py-2">
                                            <div className="flex flex-wrap gap-1.5">
                                                {row.platforms.map((p) => {
                                                    const cfg = PLATFORMS[p];
                                                    if (!cfg) return null;
                                                    const Icon = cfg.icon;
                                                    return (
                                                        <span
                                                            key={p}
                                                            className="inline-flex items-center gap-1 rounded border border-zinc-700/80 bg-zinc-950/80 px-1.5 py-0.5 text-[10px] text-zinc-300"
                                                        >
                                                            <Icon className={cn('size-3', cfg.className)} />
                                                            {cfg.label}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[280px] px-3 py-2 text-[11px] leading-snug text-zinc-300">
                                            {row.title}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-3 py-2 text-[11px] text-zinc-400">
                                            {row.format}
                                        </TableCell>
                                        <TableCell className="px-4 py-2">
                                            <span
                                                className={cn(
                                                    'inline-flex rounded border px-2 py-0.5 text-[10px] font-medium capitalize',
                                                    statusStyle(row.status),
                                                )}
                                            >
                                                {row.status}
                                            </span>
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
