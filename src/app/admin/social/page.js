'use client';

import * as React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Share2,
    Instagram,
    Facebook,
    Image as ImageIcon,
    Plus,
    MessageSquare,
    Heart,
    Trash2,
    BarChart2,
    Search,
    ChevronLeft,
    ChevronRight,
    Workflow,
    Sparkles,
    Copy,
    RefreshCw,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PLATFORMS = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-400', bg: 'bg-blue-500/10' },
];

const MOCK_ACCOUNTS = [
    { id: 'ig1', platform: 'instagram', handle: '@carne_seca_texas', followers: 1240, connected: true },
    { id: 'fb1', platform: 'facebook', handle: 'Carne Seca Texas', followers: 890, connected: true },
];

const MOCK_POSTS = [
    { id: 'p1', text: 'New batch of Premium Brisket 12oz just landed! 🥩 Limited run — grab yours before it\'s gone.', platforms: ['instagram', 'facebook'], status: 'published', scheduledAt: null, publishedAt: '2025-02-18T14:00', likes: 42, comments: 8, shares: 3 },
    { id: 'p2', text: 'Behind the scenes: smokehouse prep at 5am 💨', platforms: ['instagram'], status: 'scheduled', scheduledAt: '2025-02-20T09:00', publishedAt: null, likes: 0, comments: 0, shares: 0 },
    { id: 'p3', text: 'Wholesale partners: we\'re now taking orders for March. DM us for pricing.', platforms: ['instagram', 'facebook'], status: 'draft', scheduledAt: null, publishedAt: null, likes: 0, comments: 0, shares: 0 },
];

const MOCK_DMS = [
    { id: 'dm1', platform: 'instagram', from: 'maria_chen', preview: 'Interested in wholesale — what\'s your minimum?', time: '2h ago', unread: true },
    { id: 'dm2', platform: 'instagram', from: 'bbq_lover_99', preview: 'Love the garlic & herb flavor!', time: '1d ago', unread: false },
];

const ENGAGEMENT_DATA = [
    { day: 'Mon', likes: 24, comments: 6, reach: 320 },
    { day: 'Tue', likes: 31, comments: 4, reach: 410 },
    { day: 'Wed', likes: 18, comments: 9, reach: 280 },
    { day: 'Thu', likes: 42, comments: 8, reach: 520 },
    { day: 'Fri', likes: 56, comments: 12, reach: 680 },
];

const MOCK_N8N_SUGGESTIONS = [
    { id: 's1', text: '🔥 Limited run: Premium Brisket 12oz is back! We smoke it for 18 hours. Link in bio.', source: 'Inventory + best performer', score: 92 },
    { id: 's2', text: 'Behind the scenes: 5am in the smokehouse. This is where the magic happens. 💨', source: 'BTS content · high engagement', score: 85 },
    { id: 's3', text: 'Wholesale partners: Taking March orders now. DM for pricing & min. order info.', source: 'Lead gen · seasonal', score: 78 },
    { id: 's4', text: 'New flavor dropping soon. Drop a 🔥 if you want early access.', source: 'Teaser · trending', score: 88 },
];

const N8N_WEBHOOK_URL = 'https://yoursite.com/api/webhooks/n8n/content-suggestions';

export default function SocialPage() {
    const [posts, setPosts] = React.useState(MOCK_POSTS);
    const [createPostOpen, setCreatePostOpen] = React.useState(false);
    const [newPost, setNewPost] = React.useState({ text: '', platforms: [], scheduledAt: '', status: 'draft' });
    const [postFilter, setPostFilter] = React.useState('all');
    const [search, setSearch] = React.useState('');
    const [page, setPage] = React.useState(1);
    const [suggestions, setSuggestions] = React.useState(MOCK_N8N_SUGGESTIONS);
    const [n8nConfigOpen, setN8nConfigOpen] = React.useState(false);
    const [fetchingSuggestions, setFetchingSuggestions] = React.useState(false);

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {}
    };

    const useSuggestion = (suggestion) => {
        setNewPost((p) => ({ ...p, text: suggestion.text, platforms: ['instagram', 'facebook'] }));
        setCreatePostOpen(true);
    };

    const dismissSuggestion = (id) => {
        setSuggestions((prev) => prev.filter((s) => s.id !== id));
    };

    const fetchSuggestions = () => {
        setFetchingSuggestions(true);
        setTimeout(() => {
            setSuggestions(MOCK_N8N_SUGGESTIONS);
            setFetchingSuggestions(false);
        }, 800);
    };

    const filteredPosts = React.useMemo(() => {
        let result = posts;
        if (postFilter !== 'all') {
            result = result.filter((p) => p.status === postFilter);
        }
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            result = result.filter((p) => p.text.toLowerCase().includes(q));
        }
        return result;
    }, [posts, postFilter, search]);

    const PAGE_SIZE = 5;
    const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
    const paginatedPosts = filteredPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleAddPost = (e) => {
        e.preventDefault();
        if (!newPost.text.trim()) return;
        const post = {
            id: `p-${Date.now()}`,
            text: newPost.text.trim(),
            platforms: newPost.platforms.length ? newPost.platforms : ['instagram'],
            status: newPost.scheduledAt ? 'scheduled' : 'draft',
            scheduledAt: newPost.scheduledAt || null,
            publishedAt: null,
            likes: 0,
            comments: 0,
            shares: 0,
        };
        setPosts((prev) => [post, ...prev]);
        setCreatePostOpen(false);
        setNewPost({ text: '', platforms: [], scheduledAt: '', status: 'draft' });
    };

    const togglePlatform = (platformId) => {
        setNewPost((p) => ({
            ...p,
            platforms: p.platforms.includes(platformId)
                ? p.platforms.filter((x) => x !== platformId)
                : [...p.platforms, platformId],
        }));
    };

    const deletePost = (id) => {
        setPosts((prev) => prev.filter((p) => p.id !== id));
    };

    const formatDate = (d) => {
        if (!d) return '—';
        const dt = new Date(d);
        return dt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-zinc-100">Social Media Manager</h1>
                    <p className="mt-0.5 text-xs text-zinc-500">
                        Schedule posts · n8n content suggestions · Track engagement
                    </p>
                </div>
                <Button
                    size="sm"
                    className="h-8 gap-1.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                    onClick={() => setCreatePostOpen(true)}
                >
                    <Plus className="size-3.5" />
                    Create Post
                </Button>
            </div>

            {/* Connected accounts */}
            <Card className="border-[0.5px] border-zinc-800 overflow-hidden bg-zinc-900">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-zinc-100">Connected Accounts</CardTitle>
                    <CardDescription className="text-[10px] text-zinc-500">
                        Connect your social profiles to schedule and publish
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        {MOCK_ACCOUNTS.map((acc) => {
                            const platform = PLATFORMS.find((p) => p.id === acc.platform);
                            const Icon = platform?.icon ?? Share2;
                            return (
                                <div
                                    key={acc.id}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg border px-4 py-3',
                                        acc.connected ? 'border-zinc-700/80 bg-zinc-950/50' : 'border-zinc-800 bg-zinc-900/50 opacity-60',
                                    )}
                                >
                                    <div className={cn('rounded-lg p-2', platform?.bg, platform?.color)}>
                                        <Icon className="size-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-100">{acc.handle}</p>
                                        <p className="text-[10px] text-zinc-500">
                                            {acc.followers.toLocaleString()} followers · {platform?.name}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 border-zinc-700 text-[10px]"
                                    >
                                        {acc.connected ? 'Disconnect' : 'Connect'}
                                    </Button>
                                </div>
                            );
                        })}
                        <div className="flex items-center gap-3 rounded-lg border border-dashed border-zinc-700 px-4 py-3">
                            <Share2 className="size-5 text-zinc-500" />
                            <span className="text-xs text-zinc-500">Add account (coming soon)</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* n8n Content Hub — suggested content from workflows */}
            <Card className="border-[0.5px] border-zinc-800 overflow-hidden bg-zinc-900">
                <CardHeader className="pb-2">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                                <Workflow className="size-4 text-violet-400" />
                                n8n Content Hub
                            </CardTitle>
                            <CardDescription className="text-[10px] text-zinc-500">
                                AI-curated suggestions from n8n workflows (inventory, trends, best performers)
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 border-zinc-700 text-[10px]"
                                onClick={() => setN8nConfigOpen(true)}
                            >
                                <Zap className="size-3" />
                                Configure n8n
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 border-violet-500/50 text-violet-400 hover:bg-violet-500/10 text-[10px]"
                                onClick={fetchSuggestions}
                                disabled={fetchingSuggestions}
                            >
                                <RefreshCw className={cn('size-3', fetchingSuggestions && 'animate-spin')} />
                                {fetchingSuggestions ? 'Fetching…' : 'Fetch suggestions'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {suggestions.length === 0 ? (
                            <div className="col-span-2 rounded-lg border border-dashed border-zinc-700 py-8 text-center">
                                <Sparkles className="mx-auto size-8 text-zinc-600" />
                                <p className="mt-2 text-xs text-zinc-500">No suggestions. Configure n8n and run &quot;Fetch suggestions&quot;.</p>
                            </div>
                        ) : (
                            suggestions.map((s) => (
                                <div
                                    key={s.id}
                                    className="flex flex-col gap-2 rounded-lg border border-zinc-700/80 bg-zinc-950/50 p-3"
                                >
                                    <p className="text-[11px] text-zinc-300 line-clamp-3">{s.text}</p>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[9px] text-zinc-500">
                                            {s.source} · score {s.score}
                                        </span>
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 px-2 text-[10px] text-zinc-500 hover:text-zinc-100"
                                                onClick={() => dismissSuggestion(s.id)}
                                            >
                                                Dismiss
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-6 px-2 text-[10px] bg-violet-500/20 text-violet-400 hover:bg-violet-500/30"
                                                onClick={() => useSuggestion(s)}
                                            >
                                                Use this
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-3">
                {/* Content calendar / posts */}
                <div className="space-y-4 lg:col-span-2">
                    <Card className="border-[0.5px] border-zinc-800 overflow-hidden bg-zinc-900">
                        <CardHeader className="pb-2">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className="text-sm font-semibold text-zinc-100">Content Calendar</CardTitle>
                                    <CardDescription className="text-[10px] text-zinc-500">
                                        Draft, scheduled & published posts
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1 min-w-[140px]">
                                        <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                                        <Input
                                            placeholder="Search posts…"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="h-8 border-zinc-700 bg-zinc-950 pl-8 text-xs"
                                        />
                                    </div>
                                    <Select value={postFilter} onValueChange={setPostFilter}>
                                        <SelectTrigger className="h-8 w-[120px] border-zinc-700 bg-zinc-950 text-[10px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all" className="text-xs">All</SelectItem>
                                            <SelectItem value="draft" className="text-xs">Draft</SelectItem>
                                            <SelectItem value="scheduled" className="text-xs">Scheduled</SelectItem>
                                            <SelectItem value="published" className="text-xs">Published</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-zinc-800 hover:!bg-transparent">
                                        <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Content</TableHead>
                                        <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Platforms</TableHead>
                                        <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Status</TableHead>
                                        <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Date</TableHead>
                                        <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Engagement</TableHead>
                                        <TableHead className="h-8 w-12 px-2 text-[10px] text-zinc-500" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedPosts.length === 0 ? (
                                        <TableRow className="border-zinc-800">
                                            <TableCell colSpan={6} className="py-8 text-center text-sm text-zinc-500">
                                                No posts match.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedPosts.map((post) => (
                                            <TableRow key={post.id} className="border-zinc-800/50">
                                                <TableCell className="max-w-[200px] px-3 py-2">
                                                    <p className="truncate text-[11px] text-zinc-300">{post.text}</p>
                                                </TableCell>
                                                <TableCell className="px-3 py-2">
                                                    <div className="flex gap-1">
                                                        {post.platforms.map((pid) => {
                                                            const p = PLATFORMS.find((x) => x.id === pid);
                                                            const Icon = p?.icon ?? Share2;
                                                            return (
                                                                <span key={pid} className={cn('rounded p-1', p?.bg, p?.color)}>
                                                                    <Icon className="size-3" />
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-3 py-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'text-[10px]',
                                                            post.status === 'published' && 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
                                                            post.status === 'scheduled' && 'border-amber-500/50 bg-amber-500/10 text-amber-400',
                                                            post.status === 'draft' && 'border-zinc-600 bg-zinc-800/50 text-zinc-400',
                                                        )}
                                                    >
                                                        {post.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-3 py-2 text-[10px] text-zinc-400">
                                                    {post.publishedAt ? formatDate(post.publishedAt) : post.scheduledAt ? formatDate(post.scheduledAt) : '—'}
                                                </TableCell>
                                                <TableCell className="px-3 py-2 text-[10px] text-zinc-400">
                                                    {post.status === 'published' ? (
                                                        <span>
                                                            <Heart className="inline size-3" /> {post.likes} · <MessageSquare className="inline size-3" /> {post.comments}
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-3 py-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 px-2 text-zinc-400 hover:text-zinc-100"
                                                        onClick={() => deletePost(post.id)}
                                                    >
                                                        <Trash2 className="size-3" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between border-t border-zinc-800 px-3 py-2">
                                    <p className="text-[10px] text-zinc-500">{filteredPosts.length} posts</p>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 gap-1 border-zinc-700 px-2 text-[10px]"
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page <= 1}
                                        >
                                            <ChevronLeft className="size-3" /> Prev
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 gap-1 border-zinc-700 px-2 text-[10px]"
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page >= totalPages}
                                        >
                                            Next <ChevronRight className="size-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right column: Engagement + Inbox */}
                <div className="space-y-4">
                    <Card className="border-[0.5px] border-zinc-800 overflow-hidden bg-zinc-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-zinc-100">Engagement</CardTitle>
                            <CardDescription className="text-[10px] text-zinc-500">
                                Last 5 days
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {ENGAGEMENT_DATA.map((row) => (
                                    <div key={row.day} className="flex items-center justify-between rounded border border-zinc-700/60 px-3 py-2">
                                        <span className="text-[10px] font-medium text-zinc-400">{row.day}</span>
                                        <div className="flex gap-4 text-[10px] text-zinc-300">
                                            <span><Heart className="inline size-3 text-pink-400/80" /> {row.likes}</span>
                                            <span><MessageSquare className="inline size-3 text-blue-400/80" /> {row.comments}</span>
                                            <span><BarChart2 className="inline size-3 text-emerald-400/80" /> {row.reach}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-[0.5px] border-zinc-800 overflow-hidden bg-zinc-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-zinc-100">Inbox</CardTitle>
                            <CardDescription className="text-[10px] text-zinc-500">
                                DMs from connected platforms
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {MOCK_DMS.map((dm) => {
                                    const platform = PLATFORMS.find((p) => p.id === dm.platform);
                                    const Icon = platform?.icon ?? MessageSquare;
                                    return (
                                        <div
                                            key={dm.id}
                                            className={cn(
                                                'flex items-start gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-colors',
                                                dm.unread ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-zinc-700/60 hover:bg-zinc-800/50',
                                            )}
                                        >
                                            <div className={cn('mt-0.5 rounded p-1', platform?.bg, platform?.color)}>
                                                <Icon className="size-3" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[11px] font-medium text-zinc-200">
                                                    {dm.from}
                                                    {dm.unread && <span className="ml-1 size-1.5 rounded-full bg-indigo-400" />}
                                                </p>
                                                <p className="truncate text-[10px] text-zinc-500">{dm.preview}</p>
                                                <p className="text-[9px] text-zinc-600">{dm.time}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <Button variant="outline" size="sm" className="mt-3 h-7 w-full border-zinc-700 text-[10px]">
                                View all messages
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* n8n Config Modal */}
            <Dialog open={n8nConfigOpen} onOpenChange={setN8nConfigOpen}>
                <DialogContent className="max-w-lg border-zinc-800 bg-zinc-950">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Workflow className="size-4 text-violet-400" />
                            Configure n8n Content Hub
                        </DialogTitle>
                        <DialogDescription>
                            Wire n8n workflows to suggest content. Your workflow can use inventory, engagement, trends, then POST suggestions here.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-zinc-400">Webhook URL (POST)</Label>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={N8N_WEBHOOK_URL}
                                    className="h-8 border-zinc-700 bg-zinc-900/80 font-mono text-[10px]"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 shrink-0 border-zinc-700 px-2"
                                    onClick={() => copyToClipboard(N8N_WEBHOOK_URL)}
                                >
                                    <Copy className="size-3.5" />
                                </Button>
                            </div>
                            <p className="text-[9px] text-zinc-500">
                                n8n HTTP Request node → POST to this URL with JSON body below
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-zinc-400">Sample payload</Label>
                            <pre className="rounded border border-zinc-700 bg-zinc-900/80 p-3 font-mono text-[10px] text-zinc-400 overflow-x-auto">
{`{
  "suggestions": [
    {
      "text": "Your post copy here...",
      "source": "inventory · back in stock",
      "score": 85
    }
  ]
}`}
                            </pre>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[10px]"
                                onClick={() => copyToClipboard(`{"suggestions":[{"text":"","source":"","score":0}]}`)}
                            >
                                <Copy className="size-3 mr-1" />
                                Copy sample
                            </Button>
                        </div>
                        <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2">
                            <p className="text-[10px] text-zinc-400">
                                <strong className="text-violet-400">n8n workflow ideas:</strong> Fetch inventory (low stock, back in stock), top products, engagement stats, seasonal triggers, then use AI to generate post copy and POST to this webhook.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setN8nConfigOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Post Modal */}
            <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
                <DialogContent className="max-w-md border-zinc-800 bg-zinc-950">
                    <DialogHeader>
                        <DialogTitle>Create Post</DialogTitle>
                        <DialogDescription>
                            Compose, use n8n suggestions, or schedule for connected platforms
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddPost} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs">Content</Label>
                            <textarea
                                value={newPost.text}
                                onChange={(e) => setNewPost((p) => ({ ...p, text: e.target.value }))}
                                placeholder="What's on your mind?"
                                rows={4}
                                className="w-full rounded-md border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        <div className="rounded-lg border border-zinc-700/60 bg-zinc-900/50 p-2">
                            <Label className="text-[10px] text-zinc-500">Add image (placeholder)</Label>
                            <div className="mt-2 flex h-20 items-center justify-center rounded border border-dashed border-zinc-600 bg-zinc-950/50">
                                <ImageIcon className="size-6 text-zinc-600" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Platforms</Label>
                            <div className="flex gap-2">
                                {PLATFORMS.map((p) => {
                                    const Icon = p.icon;
                                    const checked = newPost.platforms.includes(p.id);
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => togglePlatform(p.id)}
                                            className={cn(
                                                'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors',
                                                checked ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-300' : 'border-zinc-700 bg-zinc-900/80 text-zinc-500 hover:bg-zinc-800',
                                            )}
                                        >
                                            <Icon className="size-4" />
                                            {p.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Schedule (optional)</Label>
                            <Input
                                type="datetime-local"
                                value={newPost.scheduledAt}
                                onChange={(e) => setNewPost((p) => ({ ...p, scheduledAt: e.target.value }))}
                                className="h-8 border-zinc-700 bg-zinc-900/80"
                            />
                            <p className="text-[10px] text-zinc-500">Leave empty to save as draft</p>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreatePostOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500">
                                {newPost.scheduledAt ? 'Schedule' : 'Save Draft'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
