'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/helpers';
import { exportExpensesToCsv } from '@/lib/utils/exportExpenses';
import { AddExpenseModal } from './AddExpenseModal';
import { EditExpenseModal } from './EditExpenseModal';
import { DeleteExpenseModal } from './DeleteExpenseModal';
import { ExpensesTable, CATEGORY_STYLES } from './ExpensesTable';
import { ExpensesKpiCards } from './ExpensesKpiCards';
import { EXPENSE_PAYMENT_METHOD_UI_OPTIONS } from '@/lib/utils/normalizeExpenseFromDb';
import { addExpense } from '@/app/actions/expenses/addExpense';
import { updateExpense } from '@/app/actions/expenses/updateExpense';
import { deleteExpense } from '@/app/actions/expenses/deleteExpense';

function normalizePaymentMethod(value) {
    const s = String(value ?? '').trim();
    if (s === 'ACH') return 'Check';
    if (EXPENSE_PAYMENT_METHOD_UI_OPTIONS.includes(s)) return s;
    if (s === 'Card') return 'Credit card';
    return EXPENSE_PAYMENT_METHOD_UI_OPTIONS[0] ?? 'Cash';
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

export function ExpensesClient({ initialExpenses = [] }) {
    const [expenses, setExpenses] = React.useState(() => {
        const raw =
            typeof structuredClone === 'function'
                ? structuredClone(initialExpenses)
                : JSON.parse(JSON.stringify(initialExpenses));
        return Array.isArray(raw) ? raw : [];
    });
    const [addOpen, setAddOpen] = React.useState(false);
    const [editExpense, setEditExpense] = React.useState(null);
    const [expenseToDelete, setExpenseToDelete] = React.useState(null);
    const [query, setQuery] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('all');
    const [dateRange, setDateRange] = React.useState({ from: undefined, to: undefined });
    const [currentPage, setCurrentPage] = React.useState(1);
    const [snapshotNow] = React.useState(() => Date.now());

    // isPending states — one per action
    const [isAdding, setIsAdding] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

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
                String(x.note ?? '')
                    .toLowerCase()
                    .includes(q) ||
                x.category.toLowerCase().includes(q) ||
                String(normalizePaymentMethod(x.paymentMethod)).toLowerCase().includes(q)
            );
        });
    }, [categoryFilter, query, expenses, dateRange]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [query, categoryFilter, dateRange]);

    const kpis = React.useMemo(() => {
        const total = filteredExpenses.reduce((s, x) => s + x.amountCents, 0);
        const thisWeek = filteredExpenses
            .filter((x) => (expenseDateMs(x.date) ?? 0) >= snapshotNow - 7 * 24 * 60 * 60 * 1000)
            .reduce((s, x) => s + x.amountCents, 0);
        const avgTicket = filteredExpenses.length ? Math.round(total / filteredExpenses.length) : 0;
        return { total, thisWeek, avgTicket };
    }, [filteredExpenses, snapshotNow]);

    const handleAddExpense = React.useCallback(async (payload) => {
        setIsAdding(true);
        try {
            const result = await addExpense(payload);
            if (!result.success) {
                toast.error(result.message ?? 'Failed to add expense');
                return;
            }
            // Use the normalized row returned from the DB — not the local payload
            setExpenses((prev) => [result.data, ...prev]);
            setAddOpen(false);
            toast.success('Expense added');
        } finally {
            setIsAdding(false);
        }
    }, []);

    const handleSaveExpense = React.useCallback(async (id, updates) => {
        setIsSaving(true);
        try {
            const result = await updateExpense({ id, ...updates });
            if (!result.success) {
                toast.error(result.message ?? 'Failed to update expense');
                return;
            }
            setExpenses((prev) => prev.map((e) => (e.id === id ? result.data : e)));
            setEditExpense(null);
            toast.success('Expense updated');
        } finally {
            setIsSaving(false);
        }
    }, []);

    const handleDeleteExpense = React.useCallback(async (id) => {
        setIsDeleting(true);
        try {
            const result = await deleteExpense({ id });
            if (!result.success) {
                toast.error(result.message ?? 'Failed to delete expense');
                return;
            }
            setExpenses((prev) => prev.filter((e) => e.id !== id));
            setExpenseToDelete(null);
            toast.success('Expense deleted');
        } finally {
            setIsDeleting(false);
        }
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

            <ExpensesKpiCards dateRange={dateRange} onDateChange={setDateRange} kpis={kpis} />

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
                    onClick={() => exportExpensesToCsv(filteredExpenses, normalizePaymentMethod)}
                >
                    <Download className="size-4" />
                    Export CSV
                </Button>
            </div>

            <ExpensesTable
                filteredExpenses={filteredExpenses}
                query={query}
                onQueryChange={setQuery}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onEdit={setEditExpense}
                onDelete={setExpenseToDelete}
                normalizePaymentMethod={normalizePaymentMethod}
            />

            <AddExpenseModal
                open={addOpen}
                onOpenChange={setAddOpen}
                categoryOptions={categoryOptions}
                paymentMethodOptions={EXPENSE_PAYMENT_METHOD_UI_OPTIONS}
                isPending={isAdding}
                onAdd={handleAddExpense}
            />

            <EditExpenseModal
                expense={editExpense}
                open={editExpense != null}
                onOpenChange={(o) => {
                    if (!o) setEditExpense(null);
                }}
                categoryOptions={categoryOptions}
                paymentMethodOptions={EXPENSE_PAYMENT_METHOD_UI_OPTIONS}
                normalizePaymentMethod={normalizePaymentMethod}
                isPending={isSaving}
                onSave={handleSaveExpense}
            />

            <DeleteExpenseModal
                expense={expenseToDelete}
                open={expenseToDelete != null}
                onOpenChange={(o) => {
                    if (!o) setExpenseToDelete(null);
                }}
                normalizePaymentMethod={normalizePaymentMethod}
                isPending={isDeleting}
                onConfirm={handleDeleteExpense}
            />
        </div>
    );
}
