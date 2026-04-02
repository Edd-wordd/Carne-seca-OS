'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileStack, Search, Instagram, Facebook, CalendarClock, Send, PencilLine } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

const PLATFORMS = {
    instagram: { label: 'IG', icon: Instagram, className: 'text-pink-400' },
    facebook: { label: 'FB', icon: Facebook, className: 'text-blue-400' },
};

const INITIAL_POSTS = [
    {
        id: 'pm-1',
        text: "New batch of Premium Brisket 12oz just landed! 🥩 Limited run — grab yours before it's gone.",
        platforms: ['instagram', 'facebook'],
        status: 'published',
        scheduledAt: null,
        publishedAt: '2026-03-28T14:00:00',
    },
    {
        id: 'pm-2',
        text: 'Behind the scenes: smokehouse prep at 5am 💨',
        platforms: ['instagram'],
        status: 'scheduled',
        scheduledAt: '2026-04-05T09:00:00',
        publishedAt: null,
    },
    {
        id: 'pm-3',
        text: "Wholesale partners: we're now taking orders for April. DM us for pricing.",
        platforms: ['instagram', 'facebook'],
        status: 'draft',
        scheduledAt: null,
        publishedAt: null,
    },
    {
        id: 'pm-4',
        text: 'Weekend pop-up this Saturday — first 20 customers get a sample pack.',
        platforms: ['instagram'],
        status: 'draft',
        scheduledAt: null,
        publishedAt: null,
    },
];

function statusPill(status) {
    switch (status) {
        case 'draft':
            return 'border-zinc-600/50 bg-zinc-800/60 text-zinc-400';
        case 'scheduled':
            return 'border-amber-600/40 bg-amber-500/10 text-amber-300';
        case 'published':
            return 'border-emerald-600/40 bg-emerald-500/10 text-emerald-300';
        default:
            return 'border-zinc-600/50 bg-zinc-800/50 text-zinc-400';
    }
}

function formatWhen(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export default function SocialPostManagerPage() {
    const [posts, setPosts] = React.useState(INITIAL_POSTS);
    const [filter, setFilter] = React.useState('all');
    const [search, setSearch] = React.useState('');

    const counts = React.useMemo(() => {
        return {
            draft: posts.filter((p) => p.status === 'draft').length,
            scheduled: posts.filter((p) => p.status === 'scheduled').length,
            published: posts.filter((p) => p.status === 'published').length,
            total: posts.length,
        };
    }, [posts]);

    const rows = React.useMemo(() => {
        let list = posts;
        if (filter !== 'all') list = list.filter((p) => p.status === filter);
        const q = search.trim().toLowerCase();
        if (q) list = list.filter((p) => p.text.toLowerCase().includes(q));
        return list;
    }, [posts, filter, search]);

    const scheduleDraft = (id) => {
        const when = new Date();
        when.setDate(when.getDate() + 2);
        when.setHours(10, 0, 0, 0);
        setPosts((prev) =>
            prev.map((p) =>
                p.id === id
                    ? { ...p, status: 'scheduled', scheduledAt: when.toISOString(), publishedAt: null }
                    : p,
            ),
        );
    };

    const publishNow = (id) => {
        const when = new Date().toISOString();
        setPosts((prev) =>
            prev.map((p) =>
                p.id === id
                    ? { ...p, status: 'published', publishedAt: when, scheduledAt: null }
                    : p,
            ),
        );
    };

    const backToDraft = (id) => {
        setPosts((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, status: 'draft', scheduledAt: null, publishedAt: null } : p,
            ),
        );
    };

    const filterBtn = (key, label, count) => (
        <button
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
                'rounded-md border px-2.5 py-1 text-[10px] font-medium transition-colors',
                filter === key
                    ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300'
                    : 'border-zinc-700/80 bg-zinc-950/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300',
            )}
        >
            {label}
            <span className="ml-1 tabular-nums text-zinc-500">({count})</span>
        </button>
    );

    return (
        <div className="space-y-4">
            <div className="flex gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/80">
                    <FileStack className="size-4 text-cyan-400/90" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-zinc-100">Post Manager</h1>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-500">
                        Draft, schedule, and publish — all in one place. Changes below stay in this browser session
                        only; no APIs wired.
                    </p>
                </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-4">
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Total posts</p>
                            <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-100">{counts.total}</p>
                        </div>
                        <FileStack className="size-4 text-cyan-400/70" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Drafts</p>
                            <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-400">{counts.draft}</p>
                        </div>
                        <PencilLine className="size-4 text-zinc-500" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Scheduled</p>
                            <p className="mt-0.5 text-lg font-semibold tabular-nums text-amber-400">{counts.scheduled}</p>
                        </div>
                        <CalendarClock className="size-4 text-amber-400/70" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Published</p>
                            <p className="mt-0.5 text-lg font-semibold tabular-nums text-emerald-400">
                                {counts.published}
                            </p>
                        </div>
                        <Send className="size-4 text-emerald-400/70" />
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader className="space-y-3 pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-sm text-zinc-100">Queue</CardTitle>
                            <CardDescription className="text-[10px] text-zinc-500">
                                Draft → schedule → publish (local preview only)
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
                            <Input
                                placeholder="Search copy…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-8 border-zinc-700 bg-zinc-950 pl-8 text-xs text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {filterBtn('all', 'All', counts.total)}
                        {filterBtn('draft', 'Drafts', counts.draft)}
                        {filterBtn('scheduled', 'Scheduled', counts.scheduled)}
                        {filterBtn('published', 'Published', counts.published)}
                    </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Post</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Channels</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Status</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Goes live</TableHead>
                                <TableHead className="h-8 px-4 text-right text-[10px] text-zinc-500">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow className="border-zinc-800/80">
                                    <TableCell colSpan={5} className="py-10 text-center text-sm text-zinc-500">
                                        No posts in this view.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((post) => (
                                    <TableRow key={post.id} className="border-zinc-800/80">
                                        <TableCell className="max-w-[min(360px,50vw)] px-4 py-2">
                                            <p className="line-clamp-2 text-[11px] leading-snug text-zinc-300">
                                                {post.text}
                                            </p>
                                            <p className="mt-0.5 font-mono text-[10px] text-zinc-600">{post.id}</p>
                                        </TableCell>
                                        <TableCell className="px-3 py-2">
                                            <div className="flex flex-wrap gap-1">
                                                {post.platforms.map((p) => {
                                                    const cfg = PLATFORMS[p];
                                                    if (!cfg) return null;
                                                    const Icon = cfg.icon;
                                                    return (
                                                        <span
                                                            key={p}
                                                            className="inline-flex items-center gap-0.5 rounded border border-zinc-700/80 bg-zinc-950/80 px-1 py-0.5 text-[9px] text-zinc-400"
                                                        >
                                                            <Icon className={cn('size-2.5', cfg.className)} />
                                                            {cfg.label}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-3 py-2">
                                            <span
                                                className={cn(
                                                    'inline-flex rounded border px-2 py-0.5 text-[10px] font-medium capitalize',
                                                    statusPill(post.status),
                                                )}
                                            >
                                                {post.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-3 py-2 text-[11px] text-zinc-400">
                                            {post.status === 'published' && formatWhen(post.publishedAt)}
                                            {post.status === 'scheduled' && formatWhen(post.scheduledAt)}
                                            {post.status === 'draft' && '—'}
                                        </TableCell>
                                        <TableCell className="px-4 py-2">
                                            <div className="flex flex-wrap justify-end gap-1">
                                                {post.status === 'draft' && (
                                                    <>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 gap-1 border-zinc-600 px-2 text-[10px] text-amber-300 hover:bg-amber-500/10"
                                                            onClick={() => scheduleDraft(post.id)}
                                                        >
                                                            <CalendarClock className="size-3" />
                                                            Schedule
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            className="h-7 gap-1 bg-emerald-500/20 px-2 text-[10px] text-emerald-300 hover:bg-emerald-500/30"
                                                            onClick={() => publishNow(post.id)}
                                                        >
                                                            <Send className="size-3" />
                                                            Publish
                                                        </Button>
                                                    </>
                                                )}
                                                {post.status === 'scheduled' && (
                                                    <>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            className="h-7 gap-1 bg-emerald-500/20 px-2 text-[10px] text-emerald-300 hover:bg-emerald-500/30"
                                                            onClick={() => publishNow(post.id)}
                                                        >
                                                            <Send className="size-3" />
                                                            Publish now
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 px-2 text-[10px] text-zinc-500 hover:text-zinc-300"
                                                            onClick={() => backToDraft(post.id)}
                                                        >
                                                            To draft
                                                        </Button>
                                                    </>
                                                )}
                                                {post.status === 'published' && (
                                                    <span className="text-[10px] text-zinc-600">Live</span>
                                                )}
                                            </div>
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
