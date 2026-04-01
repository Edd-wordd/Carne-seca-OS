'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, TrendingUp, Receipt, Truck, Package } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

const MOCK_EXPENSES = [
    {
        id: 'EXP-2201',
        date: '2026-03-28',
        vendor: 'Lone Star Packaging',
        category: 'Packaging',
        note: 'Vacuum bags + shipping labels',
        amountCents: 14892,
        paymentMethod: 'Card',
    },
    {
        id: 'EXP-2200',
        date: '2026-03-27',
        vendor: 'Hill Country Meats',
        category: 'Raw Materials',
        note: 'Topside round batch',
        amountCents: 40275,
        paymentMethod: 'ACH',
    },
    {
        id: 'EXP-2199',
        date: '2026-03-25',
        vendor: 'H-E-B Wholesale',
        category: 'Seasoning',
        note: 'Salt, pepper, garlic, chile',
        amountCents: 8964,
        paymentMethod: 'Card',
    },
    {
        id: 'EXP-2198',
        date: '2026-03-24',
        vendor: 'Austin Ice & Cold',
        category: 'Logistics',
        note: 'Refrigerated delivery run',
        amountCents: 11900,
        paymentMethod: 'Card',
    },
    {
        id: 'EXP-2197',
        date: '2026-03-22',
        vendor: 'Texas Dry Goods',
        category: 'Packaging',
        note: 'Retail sleeves + inserts',
        amountCents: 7340,
        paymentMethod: 'Card',
    },
];

const CATEGORY_STYLES = {
    'Raw Materials': 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    Packaging: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
    Seasoning: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    Logistics: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
};

function formatCurrency(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format((Number(cents) || 0) / 100);
}

export default function ExpensesPage() {
    const [query, setQuery] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('all');
    const [snapshotNow] = React.useState(() => Date.now());

    const categories = React.useMemo(
        () => ['all', ...Array.from(new Set(MOCK_EXPENSES.map((x) => x.category)))],
        [],
    );

    const filteredExpenses = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        return MOCK_EXPENSES.filter((x) => {
            if (categoryFilter !== 'all' && x.category !== categoryFilter) return false;
            if (!q) return true;
            return (
                x.id.toLowerCase().includes(q) ||
                x.vendor.toLowerCase().includes(q) ||
                x.note.toLowerCase().includes(q) ||
                x.category.toLowerCase().includes(q)
            );
        });
    }, [categoryFilter, query]);

    const kpis = React.useMemo(() => {
        const total = filteredExpenses.reduce((s, x) => s + x.amountCents, 0);
        const thisWeek = filteredExpenses
            .filter((x) => new Date(x.date).getTime() >= snapshotNow - 7 * 24 * 60 * 60 * 1000)
            .reduce((s, x) => s + x.amountCents, 0);
        const packaging = filteredExpenses
            .filter((x) => x.category === 'Packaging')
            .reduce((s, x) => s + x.amountCents, 0);
        const avgTicket = filteredExpenses.length ? Math.round(total / filteredExpenses.length) : 0;
        return { total, thisWeek, packaging, avgTicket };
    }, [filteredExpenses, snapshotNow]);

    const byCategory = React.useMemo(() => {
        const grouped = new Map();
        for (const x of filteredExpenses) {
            grouped.set(x.category, (grouped.get(x.category) ?? 0) + x.amountCents);
        }
        return [...grouped.entries()].sort((a, b) => b[1] - a[1]);
    }, [filteredExpenses]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-zinc-100 text-xl font-semibold tracking-tight">Expenses</h1>
                    <p className="text-zinc-500 mt-1 text-sm">Money going out: what you are spending and on what.</p>
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
                {[
                    { label: 'Total Spend', value: formatCurrency(kpis.total), icon: Receipt, accent: 'text-red-400' },
                    { label: 'Last 7 Days', value: formatCurrency(kpis.thisWeek), icon: TrendingUp, accent: 'text-amber-400' },
                    { label: 'Packaging', value: formatCurrency(kpis.packaging), icon: Package, accent: 'text-indigo-400' },
                    { label: 'Avg Purchase', value: formatCurrency(kpis.avgTicket), icon: Truck, accent: 'text-zinc-300' },
                ].map((kpi) => (
                    <Card key={kpi.label} className="border-zinc-800 bg-zinc-900/70">
                        <CardContent className="flex items-start justify-between p-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-zinc-500">{kpi.label}</p>
                                <p className={cn('mt-1 text-base font-semibold tabular-nums', kpi.accent)}>{kpi.value}</p>
                            </div>
                            <kpi.icon className={cn('mt-0.5 size-4', kpi.accent)} />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
                <Card className="border-zinc-800 bg-zinc-900/70 lg:col-span-2">
                    <CardHeader className="pb-2">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-sm text-zinc-100">Recent expenses</CardTitle>
                                <CardDescription className="text-[10px] text-zinc-500">
                                    Mock UI only (no DB wiring yet)
                                </CardDescription>
                            </div>
                            <div className="relative w-full sm:w-56">
                                <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                                <Input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search vendor, note…"
                                    className="h-8 border-zinc-700 bg-zinc-950 pl-7 text-xs text-zinc-100 placeholder:text-zinc-500"
                                />
                            </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategoryFilter(cat)}
                                    className={cn(
                                        'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                        categoryFilter === cat
                                            ? 'bg-zinc-700 text-zinc-100'
                                            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
                                    )}
                                >
                                    {cat === 'all' ? 'All' : cat}
                                </button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800 hover:bg-transparent">
                                    <TableHead className="h-8 px-3 text-[10px] text-zinc-500">ID</TableHead>
                                    <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Vendor</TableHead>
                                    <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Category</TableHead>
                                    <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Note</TableHead>
                                    <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Date</TableHead>
                                    <TableHead className="h-8 px-3 text-right text-[10px] text-zinc-500">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredExpenses.length === 0 ? (
                                    <TableRow className="border-zinc-800/70">
                                        <TableCell colSpan={6} className="py-6 text-center text-xs text-zinc-500">
                                            No expenses match current filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredExpenses.map((x) => (
                                        <TableRow key={x.id} className="border-zinc-800/70">
                                            <TableCell className="px-3 py-2 font-mono text-[11px] text-zinc-300">
                                                {x.id}
                                            </TableCell>
                                            <TableCell className="px-3 py-2 text-[11px] text-zinc-200">{x.vendor}</TableCell>
                                            <TableCell className="px-3 py-2">
                                                <span
                                                    className={cn(
                                                        'inline-flex rounded-full border px-2 py-0.5 text-[10px]',
                                                        CATEGORY_STYLES[x.category] ??
                                                            'border-zinc-700 bg-zinc-800/70 text-zinc-300',
                                                    )}
                                                >
                                                    {x.category}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-3 py-2 text-[11px] text-zinc-400">{x.note}</TableCell>
                                            <TableCell className="px-3 py-2 text-[11px] text-zinc-400">{x.date}</TableCell>
                                            <TableCell className="px-3 py-2 text-right text-[11px] font-medium tabular-nums text-red-400">
                                                {formatCurrency(x.amountCents)}
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
                        <CardTitle className="text-sm text-zinc-100">Spend by category</CardTitle>
                        <CardDescription className="text-[10px] text-zinc-500">Current filtered view</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {byCategory.map(([category, cents]) => (
                            <div key={category} className="rounded border border-zinc-800 bg-zinc-950/40 px-3 py-2">
                                <p className="text-[11px] text-zinc-300">{category}</p>
                                <p className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-100">
                                    {formatCurrency(cents)}
                                </p>
                            </div>
                        ))}
                        {byCategory.length === 0 ? (
                            <p className="text-xs text-zinc-500">No category totals for this filter.</p>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
