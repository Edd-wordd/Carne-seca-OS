'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Download, TrendingUp, Receipt, Truck, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/helpers';
import { AddExpenseModal } from './_components/AddExpenseModal';
import { EditExpenseModal } from './_components/EditExpenseModal';
import { DeleteExpenseModal } from './_components/DeleteExpenseModal';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { normalizePaymentMethod } from './_components/expensePaymentMethods';

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
        paymentMethod: 'Check',
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
        paymentMethod: 'Cash',
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

function nextExpenseId(rows) {
    let max = 0;
    for (const x of rows) {
        const m = /^EXP-(\d+)$/.exec(x.id);
        if (m) max = Math.max(max, Number(m[1]));
    }
    return `EXP-${max + 1}`;
}

function expenseDateMs(dateStr) {
    const parts = String(dateStr ?? '')
        .trim()
        .split('-')
        .map(Number);
    if (parts.length < 3 || parts.some((n) => !Number.isFinite(n))) return null;
    const [y, m, d] = parts;
    const t = new Date(y, m - 1, d).getTime();
    return Number.isFinite(t) ? t : null;
}

function matchesExpenseDateRange(dateStr, dateRange) {
    if (!dateRange?.from) return true;
    const t = expenseDateMs(dateStr);
    if (t == null) return true;
    const startOfDay = new Date(dateRange.from);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
    endOfDay.setHours(23, 59, 59, 999);
    if (t < startOfDay.getTime() || t > endOfDay.getTime()) return false;
    return true;
}

export default function ExpensesPage() {
    const [expenses, setExpenses] = React.useState(() => [...MOCK_EXPENSES]);
    const [addOpen, setAddOpen] = React.useState(false);
    const [editExpense, setEditExpense] = React.useState(null);
    const [deleteExpense, setDeleteExpense] = React.useState(null);
    const [query, setQuery] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('all');
    const [dateRange, setDateRange] = React.useState({ from: undefined, to: undefined });
    const [snapshotNow] = React.useState(() => Date.now());

    const categoryOptions = React.useMemo(() => Object.keys(CATEGORY_STYLES), []);

    const categories = React.useMemo(
        () => ['all', ...Array.from(new Set(expenses.map((x) => x.category)))],
        [expenses],
    );

    const filteredExpenses = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        return expenses.filter((x) => {
            if (!matchesExpenseDateRange(x.date, dateRange)) return false;
            if (categoryFilter !== 'all' && x.category !== categoryFilter) return false;
            if (!q) return true;
            return (
                x.id.toLowerCase().includes(q) ||
                x.vendor.toLowerCase().includes(q) ||
                x.note.toLowerCase().includes(q) ||
                x.category.toLowerCase().includes(q) ||
                String(normalizePaymentMethod(x.paymentMethod))
                    .toLowerCase()
                    .includes(q)
            );
        });
    }, [categoryFilter, query, expenses, dateRange]);

    const kpis = React.useMemo(() => {
        const total = filteredExpenses.reduce((s, x) => s + x.amountCents, 0);
        const thisWeek = filteredExpenses
            .filter((x) => new Date(x.date).getTime() >= snapshotNow - 7 * 24 * 60 * 60 * 1000)
            .reduce((s, x) => s + x.amountCents, 0);
        const avgTicket = filteredExpenses.length ? Math.round(total / filteredExpenses.length) : 0;
        return { total, thisWeek, avgTicket };
    }, [filteredExpenses, snapshotNow]);

    const handleAddExpense = React.useCallback((payload) => {
        setExpenses((prev) => [{ id: nextExpenseId(prev), ...payload }, ...prev]);
    }, []);

    const handleSaveExpense = React.useCallback((id, updates) => {
        setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
        toast.success('Expense updated');
    }, []);

    const handleDeleteExpense = React.useCallback((id) => {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        toast.success('Expense removed');
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-zinc-100 text-xl font-semibold tracking-tight">Expenses</h1>
                    <p className="text-zinc-500 mt-1 text-sm">Money going out: what you are spending and on what.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        type="button"
                        size="sm"
                        className="h-9 gap-2 bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                        onClick={() => setAddOpen(true)}
                    >
                        <Plus className="size-4" />
                        Add expense
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Overview</span>
                    <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {[
                        { label: 'Total Spend', value: formatCurrency(kpis.total), icon: Receipt, accent: 'text-red-400' },
                        { label: 'Last 7 Days', value: formatCurrency(kpis.thisWeek), icon: TrendingUp, accent: 'text-amber-400' },
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
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                    <div className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategoryFilter(cat)}
                                className={cn(
                                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                    categoryFilter === cat
                                        ? 'bg-zinc-700 text-zinc-100'
                                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200',
                                )}
                            >
                                {cat === 'all' ? 'All' : cat}
                            </button>
                        ))}
                    </div>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                >
                    <Download className="size-4" />
                    Export CSV
                </Button>
            </div>

            <div className="mt-4">
                <div className="overflow-hidden rounded border border-zinc-800">
                    <div className="border-b border-zinc-800 bg-zinc-900/80 px-3 py-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h2 className="text-zinc-200 text-sm font-medium">Recent expenses</h2>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                                <Input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search vendor, note…"
                                    className="h-7 w-[160px] border-zinc-700 bg-zinc-950 pl-8 text-[10px] text-zinc-100 placeholder:text-zinc-500"
                                />
                            </div>
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-700/80 hover:bg-transparent">
                                <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">ID</TableHead>
                                <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Vendor</TableHead>
                                <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Category</TableHead>
                                <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Note</TableHead>
                                <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Date</TableHead>
                                <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Payment method</TableHead>
                                <TableHead className="text-zinc-400 h-8 px-3 text-right text-[10px]">Amount</TableHead>
                                <TableHead className="text-zinc-400 h-8 px-2 text-right text-[10px] w-14">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredExpenses.length === 0 ? (
                                <TableRow className="border-zinc-700/80">
                                    <TableCell colSpan={8} className="text-zinc-400 py-4 text-center text-[11px]">
                                        No expenses match current filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredExpenses.map((x) => (
                                    <TableRow
                                        key={x.id}
                                        className="group border-zinc-700/80 transition-colors hover:!bg-zinc-700/50"
                                    >
                                        <TableCell className="text-zinc-200 px-3 py-1.5 font-mono text-[11px] font-medium group-hover:text-zinc-100">
                                            {x.id}
                                        </TableCell>
                                        <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] group-hover:text-zinc-300">
                                            {x.vendor}
                                        </TableCell>
                                        <TableCell className="px-3 py-1.5">
                                            <span
                                                className={cn(
                                                    'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize',
                                                    CATEGORY_STYLES[x.category] ??
                                                        'border-zinc-700 bg-zinc-800/70 text-zinc-300',
                                                )}
                                            >
                                                {x.category}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] group-hover:text-zinc-300">
                                            {x.note}
                                        </TableCell>
                                        <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] tabular-nums group-hover:text-zinc-300">
                                            {x.date}
                                        </TableCell>
                                        <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] group-hover:text-zinc-300">
                                            {normalizePaymentMethod(x.paymentMethod)}
                                        </TableCell>
                                        <TableCell className="text-zinc-100 px-3 py-1.5 text-right text-[11px] font-medium tabular-nums group-hover:text-white">
                                            {formatCurrency(x.amountCents)}
                                        </TableCell>
                                        <TableCell
                                            className="px-2 py-1.5 text-right"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-100"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="size-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="min-w-[10rem] border-zinc-800 bg-zinc-900 text-zinc-100"
                                                >
                                                    <DropdownMenuItem
                                                        className="cursor-pointer text-xs focus:bg-zinc-800 focus:text-zinc-100"
                                                        onClick={() => setEditExpense(x)}
                                                    >
                                                        <Pencil className="mr-2 size-3.5" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="cursor-pointer text-xs text-red-400 focus:bg-zinc-800 focus:text-red-400"
                                                        onClick={() => setDeleteExpense(x)}
                                                    >
                                                        <Trash2 className="mr-2 size-3.5" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <AddExpenseModal
                open={addOpen}
                onOpenChange={setAddOpen}
                categoryOptions={categoryOptions}
                onAdd={handleAddExpense}
            />

            <EditExpenseModal
                expense={editExpense}
                open={editExpense != null}
                onOpenChange={(o) => {
                    if (!o) setEditExpense(null);
                }}
                categoryOptions={categoryOptions}
                onSave={handleSaveExpense}
            />

            <DeleteExpenseModal
                expense={deleteExpense}
                open={deleteExpense != null}
                onOpenChange={(o) => {
                    if (!o) setDeleteExpense(null);
                }}
                onConfirm={handleDeleteExpense}
            />
        </div>
    );
}
