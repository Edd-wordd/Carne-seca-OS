'use client';

import * as React from 'react';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Plus,
    Pencil,
    Trash2,
    MoreHorizontal,
    CircleDollarSign,
    Beef,
    Wrench,
    Box,
    Sparkles,
    Layers,
    Calendar,
    Search,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Download,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const SUPPLY_CATEGORIES = [
    { value: 'meat', label: 'Meat', icon: Beef },
    { value: 'equipment', label: 'Equipment', icon: Wrench },
    { value: 'packaging', label: 'Packaging', icon: Box },
    { value: 'seasoning', label: 'Seasoning', icon: Sparkles },
    { value: 'other', label: 'Other', icon: Layers },
];

const PAYMENT_METHODS = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'venmo', label: 'Venmo' },
    { value: 'zelle', label: 'Zelle' },
    { value: 'wire', label: 'Wire Transfer' },
    { value: 'other', label: 'Other' },
];

// Mock supplies with last purchased date
const MOCK_SUPPLIES = [
    {
        id: 'SUP-1',
        category: 'meat',
        name: 'Beef Brisket',
        quantity: 50,
        weight: 50,
        unit: 'lb',
        unitCost: 8.2,
        purchasedFrom: 'Restaurant Depot',
        paymentMethod: 'debit_card',
        purchasedBy: 'John',
        value: 410,
        lastPurchasedAt: '2025-02-14',
    },
    {
        id: 'SUP-2',
        category: 'equipment',
        name: 'Vacuum Sealer Pro',
        quantity: 1,
        weight: null,
        unit: 'ea',
        unitCost: 700,
        purchasedFrom: 'WebstaurantStore',
        paymentMethod: 'credit_card',
        purchasedBy: 'Maria',
        value: 700,
        lastPurchasedAt: '2025-01-08',
    },
    {
        id: 'SUP-3',
        category: 'packaging',
        name: 'Vacuum Bags 8x10',
        quantity: 420,
        weight: null,
        unit: 'pcs',
        unitCost: 0.12,
        purchasedFrom: 'Uline',
        paymentMethod: 'credit_card',
        purchasedBy: 'John',
        value: 50.4,
        lastPurchasedAt: '2025-02-10',
    },
    {
        id: 'SUP-4',
        category: 'seasoning',
        name: 'Seasoning Mix Bulk',
        quantity: 15,
        weight: 15,
        unit: 'lb',
        unitCost: 8.5,
        purchasedFrom: 'Spice World',
        paymentMethod: 'cash',
        purchasedBy: 'Alex',
        value: 127.5,
        lastPurchasedAt: '2025-02-01',
    },
];

// Purchase history: all past purchases
const MOCK_PURCHASE_HISTORY = [
    {
        id: 'PH-1',
        date: '2025-02-14',
        name: 'Beef Brisket',
        category: 'meat',
        quantity: 50,
        weight: 50,
        purchasedFrom: 'Restaurant Depot',
        paymentMethod: 'debit_card',
        purchasedBy: 'John',
        cost: 410,
    },
    {
        id: 'PH-2',
        date: '2025-02-10',
        name: 'Vacuum Bags 8x10',
        category: 'packaging',
        quantity: 420,
        purchasedFrom: 'Uline',
        paymentMethod: 'credit_card',
        purchasedBy: 'John',
        cost: 50.4,
    },
    {
        id: 'PH-3',
        date: '2025-02-01',
        name: 'Seasoning Mix Bulk',
        category: 'seasoning',
        quantity: 15,
        weight: 15,
        purchasedFrom: 'Spice World',
        paymentMethod: 'cash',
        purchasedBy: 'Alex',
        cost: 127.5,
    },
    {
        id: 'PH-4',
        date: '2025-01-15',
        name: 'Beef Brisket',
        category: 'meat',
        quantity: 40,
        weight: 40,
        purchasedFrom: 'Restaurant Depot',
        paymentMethod: 'check',
        purchasedBy: 'Maria',
        cost: 328,
    },
    {
        id: 'PH-5',
        date: '2025-01-08',
        name: 'Vacuum Sealer Pro',
        category: 'equipment',
        quantity: 1,
        purchasedFrom: 'WebstaurantStore',
        paymentMethod: 'credit_card',
        purchasedBy: 'Maria',
        cost: 700,
    },
    {
        id: 'PH-6',
        date: '2024-12-12',
        name: 'Beef Brisket',
        category: 'meat',
        quantity: 45,
        weight: 45,
        purchasedFrom: 'Restaurant Depot',
        paymentMethod: 'debit_card',
        purchasedBy: 'John',
        cost: 369,
    },
    {
        id: 'PH-7',
        date: '2024-12-05',
        name: 'Vacuum Bags 8x10',
        category: 'packaging',
        quantity: 300,
        purchasedFrom: 'Uline',
        paymentMethod: 'credit_card',
        purchasedBy: 'Maria',
        cost: 36,
    },
    {
        id: 'PH-8',
        date: '2024-11-20',
        name: 'Seasoning Mix Bulk',
        category: 'seasoning',
        quantity: 12,
        weight: 12,
        purchasedFrom: 'Spice World',
        paymentMethod: 'cash',
        purchasedBy: 'Alex',
        cost: 102,
    },
    {
        id: 'PH-9',
        date: '2024-11-08',
        name: 'Beef Brisket',
        category: 'meat',
        quantity: 38,
        weight: 38,
        purchasedFrom: 'Restaurant Depot',
        paymentMethod: 'check',
        purchasedBy: 'Maria',
        cost: 311.6,
    },
];

function escapeCsv(val) {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
    return s;
}

function formatDate(d) {
    if (!d) return '—';
    const dt = new Date(d);
    const now = new Date();
    const diffDays = Math.floor((now - dt) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return dt.toLocaleDateString();
}

export default function SuppliesPage() {
    const [addModalOpen, setAddModalOpen] = React.useState(false);
    const [editModalOpen, setEditModalOpen] = React.useState(false);
    const [editingSupply, setEditingSupply] = React.useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [supplyToDelete, setSupplyToDelete] = React.useState(null);
    const [form, setForm] = React.useState({
        name: '',
        category: 'meat',
        quantity: '',
        weight: '',
        unit: 'lb',
        unitCost: '',
        purchasedFrom: '',
        paymentMethod: 'credit_card',
        purchasedBy: '',
        purchaseDate: new Date().toISOString().slice(0, 10),
    });
    const [supplies, setSupplies] = React.useState(MOCK_SUPPLIES);
    const [supplySearch, setSupplySearch] = React.useState('');
    const [supplyPage, setSupplyPage] = React.useState(1);

    const SUPPLY_PAGE_SIZE = 5;
    const [purchaseHistory, setPurchaseHistory] = React.useState(MOCK_PURCHASE_HISTORY);

    const handleAddSupply = (e) => {
        e.preventDefault();
        const qty = parseFloat(form.quantity) || 0;
        const cost = parseFloat(form.unitCost) || 0;
        const weight = form.weight ? parseFloat(form.weight) : null;
        const purchaseDate = form.purchaseDate || new Date().toISOString().slice(0, 10);
        const value = qty * cost;
        const supply = {
            id: `SUP-${supplies.length + 1}`,
            category: form.category,
            name: form.name,
            quantity: qty,
            weight,
            unit: form.unit,
            unitCost: cost,
            purchasedFrom: form.purchasedFrom || '—',
            paymentMethod: form.paymentMethod,
            purchasedBy: form.purchasedBy || '—',
            value,
            lastPurchasedAt: purchaseDate,
        };
        const historyEntry = {
            id: `PH-${Date.now()}`,
            date: purchaseDate,
            name: form.name,
            category: form.category,
            quantity: qty,
            weight: weight ?? undefined,
            purchasedFrom: form.purchasedFrom || '—',
            paymentMethod: form.paymentMethod,
            purchasedBy: form.purchasedBy || '—',
            cost: value,
        };
        setSupplies((prev) => [supply, ...prev]);
        setPurchaseHistory((prev) => [historyEntry, ...prev]);
        setForm({
            name: '',
            category: 'meat',
            quantity: '',
            weight: '',
            unit: 'lb',
            unitCost: '',
            purchasedFrom: '',
            paymentMethod: 'credit_card',
            purchasedBy: '',
            purchaseDate: new Date().toISOString().slice(0, 10),
        });
        setAddModalOpen(false);
    };

    const openEditModal = (supply) => {
        setEditingSupply(supply);
        setForm({
            name: supply.name,
            category: supply.category,
            quantity: String(supply.quantity),
            weight: supply.weight != null ? String(supply.weight) : '',
            unit: supply.unit,
            unitCost: String(supply.unitCost),
            purchasedFrom: supply.purchasedFrom !== '—' ? supply.purchasedFrom : '',
            paymentMethod: supply.paymentMethod ?? 'credit_card',
            purchasedBy: supply.purchasedBy !== '—' ? supply.purchasedBy : '',
            purchaseDate: supply.lastPurchasedAt || new Date().toISOString().slice(0, 10),
        });
        setEditModalOpen(true);
    };

    const handleUpdateSupply = (e) => {
        e.preventDefault();
        if (!editingSupply) return;
        const qty = parseFloat(form.quantity) || 0;
        const cost = parseFloat(form.unitCost) || 0;
        const weight = form.weight ? parseFloat(form.weight) : null;
        const value = qty * cost;
        const purchaseDate = form.purchaseDate || editingSupply.lastPurchasedAt;
        const updated = {
            ...editingSupply,
            category: form.category,
            name: form.name,
            quantity: qty,
            weight,
            unit: form.unit,
            unitCost: cost,
            purchasedFrom: form.purchasedFrom || '—',
            paymentMethod: form.paymentMethod,
            purchasedBy: form.purchasedBy || '—',
            value,
            lastPurchasedAt: purchaseDate,
        };
        setSupplies((prev) => prev.map((s) => (s.id === editingSupply.id ? updated : s)));
        setPurchaseHistory((prev) =>
            prev.map((h) => {
                if (h.name === editingSupply.name && h.date === editingSupply.lastPurchasedAt) {
                    return {
                        ...h,
                        date: purchaseDate,
                        name: form.name,
                        category: form.category,
                        quantity: qty,
                        weight: weight ?? undefined,
                        purchasedFrom: form.purchasedFrom || '—',
                        paymentMethod: form.paymentMethod,
                        purchasedBy: form.purchasedBy || '—',
                        cost: value,
                    };
                }
                return h;
            }),
        );
        setForm({
            name: '',
            category: 'meat',
            quantity: '',
            weight: '',
            unit: 'lb',
            unitCost: '',
            purchasedFrom: '',
            paymentMethod: 'credit_card',
            purchasedBy: '',
        });
        setEditingSupply(null);
        setEditModalOpen(false);
    };

    const openDeleteModal = (supply) => {
        setSupplyToDelete(supply);
        setDeleteModalOpen(true);
    };

    const handleDeleteSupply = () => {
        if (!supplyToDelete) return;
        setSupplies((prev) => prev.filter((s) => s.id !== supplyToDelete.id));
        setSupplyToDelete(null);
        setDeleteModalOpen(false);
    };

    const currentMonth = new Date().toISOString().slice(0, 7);
    const uniqueMonthsForMetrics = React.useMemo(() => {
        const months = [...new Set(purchaseHistory.map((h) => h.date.slice(0, 7)))].sort().reverse();
        return months.map((m) => {
            const [y, mo] = m.split('-');
            return {
                value: m,
                label: new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                }),
            };
        });
    }, [purchaseHistory]);
    const defaultMetricsMonth = uniqueMonthsForMetrics[0]?.value ?? currentMonth;
    const [metricsMonth, setMetricsMonth] = React.useState(defaultMetricsMonth);

    const currentYear = new Date().getFullYear().toString();
    const thisMonthPurchases = React.useMemo(() => {
        if (metricsMonth === 'ytd') {
            return purchaseHistory.filter((h) => h.date.startsWith(currentYear));
        }
        return purchaseHistory.filter((h) => h.date.slice(0, 7) === metricsMonth);
    }, [purchaseHistory, metricsMonth, currentYear]);
    const byCategory = React.useMemo(() => {
        const acc = { meat: 0, equipment: 0, packaging: 0, seasoning: 0, other: 0 };
        thisMonthPurchases.forEach((h) => {
            const cat = SUPPLY_CATEGORIES.some((c) => c.value === h.category) ? h.category : 'other';
            acc[cat] = (acc[cat] || 0) + h.cost;
        });
        return acc;
    }, [thisMonthPurchases]);
    const totalValue = Object.values(byCategory).reduce((a, b) => a + b, 0);

    const metricsMonthLabel =
        metricsMonth === 'ytd' ? `YTD ${currentYear}` : uniqueMonthsForMetrics.find((m) => m.value === metricsMonth)?.label ?? metricsMonth;

    const [historyFilterMonth, setHistoryFilterMonth] = React.useState('all');
    const [historyFilterSupply, setHistoryFilterSupply] = React.useState('all');
    const [historyFilterPurchasedBy, setHistoryFilterPurchasedBy] = React.useState('all');
    const [historyFilterPayment, setHistoryFilterPayment] = React.useState('all');
    const [historyDateSortOrder, setHistoryDateSortOrder] = React.useState('desc');
    const [historyPage, setHistoryPage] = React.useState(1);

    const HISTORY_PAGE_SIZE = 5;

    const uniqueMonths = uniqueMonthsForMetrics;

    const filteredSupplies = React.useMemo(() => {
        if (!supplySearch.trim()) return supplies;
        const q = supplySearch.trim().toLowerCase();
        return supplies.filter((s) => {
            const cat = SUPPLY_CATEGORIES.find((c) => c.value === s.category)?.label ?? '';
            return (
                s.name.toLowerCase().includes(q) ||
                cat.toLowerCase().includes(q) ||
                (s.purchasedFrom && s.purchasedFrom.toLowerCase().includes(q)) ||
                (s.id && s.id.toLowerCase().includes(q))
            );
        });
    }, [supplies, supplySearch]);

    React.useEffect(() => setSupplyPage(1), [supplySearch]);

    const supplyTotalPages = Math.max(1, Math.ceil(filteredSupplies.length / SUPPLY_PAGE_SIZE));
    const safeSupplyPage = Math.min(supplyPage, supplyTotalPages);
    const paginatedSupplies = filteredSupplies.slice(
        (safeSupplyPage - 1) * SUPPLY_PAGE_SIZE,
        safeSupplyPage * SUPPLY_PAGE_SIZE
    );

    const uniqueSupplies = React.useMemo(() => {
        const names = [...new Set(purchaseHistory.map((h) => h.name))].sort();
        return names.map((n) => ({ value: n, label: n }));
    }, [purchaseHistory]);

    const uniquePurchasers = React.useMemo(() => {
        const who = [...new Set(purchaseHistory.map((h) => h.purchasedBy).filter((w) => w && w !== '—'))].sort();
        return who.map((w) => ({ value: w, label: w }));
    }, [purchaseHistory]);

    const filteredHistory = React.useMemo(() => {
        return purchaseHistory.filter((h) => {
            if (historyFilterMonth !== 'all' && h.date.slice(0, 7) !== historyFilterMonth) return false;
            if (historyFilterSupply !== 'all' && h.name !== historyFilterSupply) return false;
            if (historyFilterPurchasedBy !== 'all' && h.purchasedBy !== historyFilterPurchasedBy) return false;
            if (historyFilterPayment !== 'all' && h.paymentMethod !== historyFilterPayment) return false;
            return true;
        });
    }, [purchaseHistory, historyFilterMonth, historyFilterSupply, historyFilterPurchasedBy, historyFilterPayment]);

    const sortedFilteredHistory = React.useMemo(() => {
        return [...filteredHistory].sort((a, b) => {
            const da = a.date.localeCompare(b.date);
            return historyDateSortOrder === 'asc' ? da : -da;
        });
    }, [filteredHistory, historyDateSortOrder]);

    React.useEffect(
        () => setHistoryPage(1),
        [historyFilterMonth, historyFilterSupply, historyFilterPurchasedBy, historyFilterPayment]
    );

    const historyTotalPages = Math.max(1, Math.ceil(sortedFilteredHistory.length / HISTORY_PAGE_SIZE));
    const safeHistoryPage = Math.min(historyPage, historyTotalPages);
    const paginatedHistory = sortedFilteredHistory.slice(
        (safeHistoryPage - 1) * HISTORY_PAGE_SIZE,
        safeHistoryPage * HISTORY_PAGE_SIZE
    );

    const monthlySpendChartData = React.useMemo(() => {
        const byMonth = {};
        purchaseHistory.forEach((h) => {
            const m = h.date.slice(0, 7);
            byMonth[m] = (byMonth[m] || 0) + h.cost;
        });
        return Object.entries(byMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, total]) => {
                const [y, mo] = month.split('-');
                const monthLabel = new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                });
                return { month: monthLabel, total: Math.round(total * 100) / 100, monthKey: month };
            });
    }, [purchaseHistory]);

    const spendChartConfig = {
        total: { label: 'Spend', color: 'var(--chart-1)' },
    };

    const now = new Date();
    const dayOfMonth = now.getDate();
    const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthProgressPct = Math.round((dayOfMonth / daysInCurrentMonth) * 100);
    const currentMonthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const currentMonthSpend = React.useMemo(() => {
        return purchaseHistory.filter((h) => h.date.slice(0, 7) === currentMonth).reduce((sum, h) => sum + h.cost, 0);
    }, [purchaseHistory, currentMonth]);

    const prevMonth = React.useMemo(() => {
        const [y, m] = currentMonth.split('-').map(Number);
        return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
    }, [currentMonth]);

    const lastMonthSpend = React.useMemo(() => {
        return purchaseHistory.filter((h) => h.date.slice(0, 7) === prevMonth).reduce((sum, h) => sum + h.cost, 0);
    }, [purchaseHistory, prevMonth]);

    const spendTrack = React.useMemo(() => {
        const progressRatio = monthProgressPct / 100 || 0.01;
        const projectedTotal = currentMonthSpend / progressRatio;
        if (lastMonthSpend <= 0) return { projected: projectedTotal, diffPct: null, lastMonthLabel: null };
        const diffPct = ((projectedTotal - lastMonthSpend) / lastMonthSpend) * 100;
        const [y, mo] = prevMonth.split('-');
        const lastMonthLabel = new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
        });
        return { projected: projectedTotal, diffPct, lastMonthLabel };
    }, [currentMonthSpend, lastMonthSpend, monthProgressPct, prevMonth]);

    const handleExportCsv = () => {
        const headers = [
            'ID',
            'Item',
            'Category',
            'Qty / Weight',
            'Purchased From',
            'Payment',
            'Purchased By',
            'Last Purchased',
            'Value',
        ];
        const rows = filteredSupplies.map((s) => {
            const cat = SUPPLY_CATEGORIES.find((c) => c.value === s.category)?.label ?? s.category ?? '';
            const qtyWeight =
                s.weight != null
                    ? `${s.quantity} ${s.unit} (${s.weight} lb)`
                    : `${s.quantity} ${s.unit}`;
            const paymentLabel =
                PAYMENT_METHODS.find((p) => p.value === s.paymentMethod)?.label ?? s.paymentMethod ?? '';
            return [
                s.id ?? '',
                s.name ?? '',
                cat,
                qtyWeight,
                s.purchasedFrom ?? '',
                paymentLabel,
                s.purchasedBy ?? '',
                formatDate(s.lastPurchasedAt),
                s.value?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '',
            ]
                .map(escapeCsv)
                .join(',');
        });
        const csv = [headers.map(escapeCsv).join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `supplies-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-zinc-100 text-lg font-semibold tracking-tight">Supplies</h1>
                    <p className="text-zinc-400 mt-0.5 text-xs">Meat, equipment, packaging — by source</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 text-xs"
                        onClick={handleExportCsv}
                    >
                        <Download className="size-3.5" />
                        Export CSV
                    </Button>
                    <Button
                        size="sm"
                        className="gap-2 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                        onClick={() => setAddModalOpen(true)}
                    >
                        <Plus className="size-3.5" />
                        Add Supply
                    </Button>
                </div>
            </div>

            {/* Summary: supply spend by month */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
                <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                    <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                        <CircleDollarSign className="size-4 shrink-0 text-indigo-400/80" />
                        <div className="min-w-0">
                            <p className="truncate text-zinc-400 text-[10px]">Total ({metricsMonthLabel})</p>
                            <p className="text-zinc-100 text-sm font-semibold tabular-nums">
                                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                    {SUPPLY_CATEGORIES.map((c) => {
                        const Icon = c.icon;
                        return (
                            <div
                                key={c.value}
                                className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5"
                            >
                                <Icon className="size-4 shrink-0 text-zinc-500" />
                                <div className="min-w-0">
                                    <p className="truncate text-zinc-400 text-[10px]">{c.label}</p>
                                    <p className="text-zinc-200 text-sm font-medium tabular-nums">
                                        $
                                        {(byCategory[c.value] ?? 0).toLocaleString(undefined, {
                                            minimumFractionDigits: 0,
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex shrink-0 items-center sm:ml-auto">
                    <Select value={metricsMonth} onValueChange={setMetricsMonth}>
                        <SelectTrigger className="h-8 w-[140px] border-zinc-700 bg-zinc-950 text-zinc-100 text-[10px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ytd" className="text-xs">
                                YTD {currentYear}
                            </SelectItem>
                            <SelectItem value={currentMonth} className="text-xs">
                                {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} (current)
                            </SelectItem>
                            {uniqueMonthsForMetrics
                                .filter((m) => m.value !== currentMonth)
                                .map((m) => (
                                    <SelectItem key={m.value} value={m.value} className="text-xs">
                                        {m.label}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Month-by-month spend chart */}
            <div className="overflow-hidden rounded border border-zinc-700/80 bg-zinc-900/60">
                <div className="border-b border-zinc-700/80 bg-zinc-900/80 px-3 py-1.5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-zinc-100 text-xs font-medium">Monthly Spend</h2>
                            <p className="text-zinc-400 text-[9px]">Compare month-by-month supply spend</p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                            <div
                                className={cn(
                                    'rounded border px-2.5 py-1.5 text-[10px] shrink-0',
                                    spendTrack.lastMonthLabel != null && spendTrack.diffPct != null
                                        ? spendTrack.diffPct > 5
                                            ? 'border-amber-800/50 bg-amber-500/10 text-amber-400'
                                            : spendTrack.diffPct < -5
                                              ? 'border-emerald-800/50 bg-emerald-500/10 text-emerald-400'
                                              : 'border-zinc-600/50 bg-zinc-800/50 text-zinc-300'
                                        : 'border-zinc-600/50 bg-zinc-800/50 text-zinc-300',
                                )}
                            >
                                {spendTrack.lastMonthLabel != null && spendTrack.diffPct != null ? (
                                    <>
                                        <span className="font-medium tabular-nums">
                                            {spendTrack.diffPct > 5 ? '↑' : spendTrack.diffPct < -5 ? '↓' : '→'}
                                            {Math.abs(Math.round(spendTrack.diffPct))}% vs {spendTrack.lastMonthLabel}
                                        </span>
                                        <span className="ml-1.5 text-zinc-400">
                                            · On track for ~$
                                            {spendTrack.projected.toLocaleString(undefined, {
                                                maximumFractionDigits: 0,
                                            })}
                                        </span>
                                    </>
                                ) : (
                                    <span>
                                        On track for ~$
                                        {spendTrack.projected.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right min-w-0">
                                    <p className="text-zinc-400 text-[9px]">Through {currentMonthName}</p>
                                    <p className="text-zinc-200 text-[11px] font-medium tabular-nums">
                                        Day {dayOfMonth} of {daysInCurrentMonth} · {monthProgressPct}%
                                    </p>
                                </div>
                                <div className="w-20 flex-shrink-0">
                                    <Progress
                                        value={monthProgressPct}
                                        className="h-1.5 bg-zinc-700 [&_[data-slot=progress-indicator]]:bg-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-3">
                    {monthlySpendChartData.length === 0 ? (
                        <p className="text-zinc-400 py-8 text-center text-[11px]">
                            No purchase history yet — add supplies to see the chart
                        </p>
                    ) : (
                        <ChartContainer config={spendChartConfig} className="h-[200px] w-full">
                            <AreaChart data={monthlySpendChartData} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                                <defs>
                                    <linearGradient id="spendAreaFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-700/60" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: '#a1a1aa', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#a1a1aa', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => `$${v}`}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={(v) => [
                                                `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                                            ]}
                                        />
                                    }
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="var(--chart-1)"
                                    strokeWidth={2}
                                    fill="url(#spendAreaFill)"
                                />
                            </AreaChart>
                        </ChartContainer>
                    )}
                </div>
            </div>

            {/* Supplies Table */}
            <div className="overflow-hidden rounded border border-zinc-700/80">
                <div className="border-b border-zinc-700/80 bg-zinc-900/80 px-3 py-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-zinc-100 text-xs font-medium">Supply Items</h2>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                            <Input
                                placeholder="Search supplies…"
                                value={supplySearch}
                                onChange={(e) => setSupplySearch(e.target.value)}
                                className="h-7 w-[160px] border-zinc-700 bg-zinc-950 pl-8 text-[10px] text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="border-zinc-700/80 hover:bg-transparent">
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Item</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Category</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Qty / Weight</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Purchased From</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Payment</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Purchased By</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Last Purchased</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px] text-right">Value</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-2 text-[10px] w-12" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedSupplies.length === 0 ? (
                            <TableRow className="border-zinc-700/80">
                                <TableCell
                                    colSpan={9}
                                    className="text-zinc-400 py-8 text-center text-[11px]"
                                >
                                    {supplySearch.trim()
                                        ? 'No supplies match your search'
                                        : 'No supply items'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedSupplies.map((s) => {
                                const cat = SUPPLY_CATEGORIES.find((c) => c.value === s.category)?.label ?? s.category;
                            const qtyWeight =
                                s.weight != null
                                    ? `${s.quantity} ${s.unit} (${s.weight} lb)`
                                    : `${s.quantity} ${s.unit}`;
                            return (
                                <TableRow
                                    key={s.id}
                                    className="border-zinc-700/80 group transition-colors hover:!bg-zinc-700/50"
                                >
                                    <TableCell className="text-zinc-200 px-3 py-1.5 text-[11px] font-medium group-hover:text-zinc-100">
                                        {s.name}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] group-hover:text-zinc-300">
                                        {cat}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 tabular-nums text-[11px] group-hover:text-zinc-300">
                                        {qtyWeight}
                                    </TableCell>
                                    <TableCell className="text-zinc-500 px-3 py-1.5 text-[11px] group-hover:text-zinc-400">
                                        {s.purchasedFrom}
                                    </TableCell>
                                    <TableCell className="text-zinc-500 px-3 py-1.5 text-[11px] group-hover:text-zinc-400">
                                        {PAYMENT_METHODS.find((p) => p.value === s.paymentMethod)?.label ??
                                            s.paymentMethod ??
                                            '—'}
                                    </TableCell>
                                    <TableCell className="text-zinc-500 px-3 py-1.5 text-[11px] group-hover:text-zinc-400">
                                        {s.purchasedBy ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] group-hover:text-zinc-300">
                                        {formatDate(s.lastPurchasedAt)}
                                    </TableCell>
                                    <TableCell className="text-zinc-100 px-3 py-1.5 text-right tabular-nums text-[11px] font-medium group-hover:text-white">
                                        ${s.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="px-2 py-1.5">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-600/50"
                                                >
                                                    <MoreHorizontal className="size-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900">
                                                <DropdownMenuItem
                                                    onClick={() => openEditModal(s)}
                                                    className="text-zinc-200 cursor-pointer"
                                                >
                                                    <Pencil className="size-3.5 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onClick={() => openDeleteModal(s)}
                                                    className="text-red-400 cursor-pointer"
                                                >
                                                    <Trash2 className="size-3.5 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                        )}
                    </TableBody>
                </Table>
                {filteredSupplies.length > 0 && (
                    <div className="flex items-center justify-between gap-4 border-t border-zinc-800/80 px-4 py-3">
                        <p className="text-zinc-500 text-xs">
                            Showing {(safeSupplyPage - 1) * SUPPLY_PAGE_SIZE + 1}–
                            {Math.min(safeSupplyPage * SUPPLY_PAGE_SIZE, filteredSupplies.length)} of{' '}
                            {filteredSupplies.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80 text-xs"
                                onClick={() => setSupplyPage((p) => Math.max(1, p - 1))}
                                disabled={safeSupplyPage <= 1}
                            >
                                <ChevronLeft className="size-3.5" />
                                Prev
                            </Button>
                            <span className="px-2 text-xs text-zinc-500">
                                Page {safeSupplyPage} of {supplyTotalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80 text-xs"
                                onClick={() => setSupplyPage((p) => Math.min(supplyTotalPages, p + 1))}
                                disabled={safeSupplyPage >= supplyTotalPages}
                            >
                                Next
                                <ChevronRight className="size-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Purchase History */}
            <div className="overflow-hidden rounded border border-zinc-700/80">
                <div className="border-b border-zinc-700/80 bg-zinc-900/80 px-3 py-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="text-zinc-100 text-xs font-medium">Purchase History</h2>
                            <p className="text-zinc-400 text-[9px]">When you last bought each supply</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Select value={historyFilterMonth} onValueChange={setHistoryFilterMonth}>
                                <SelectTrigger className="h-7 w-[120px] border-zinc-700 bg-zinc-950 text-zinc-100 text-[10px]">
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs">
                                        All months
                                    </SelectItem>
                                    {uniqueMonths.map((m) => (
                                        <SelectItem key={m.value} value={m.value} className="text-xs">
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={historyFilterSupply} onValueChange={setHistoryFilterSupply}>
                                <SelectTrigger className="h-7 w-[140px] border-zinc-700 bg-zinc-950 text-zinc-100 text-[10px]">
                                    <SelectValue placeholder="Supply" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs">
                                        All supplies
                                    </SelectItem>
                                    {uniqueSupplies.map((s) => (
                                        <SelectItem key={s.value} value={s.value} className="text-xs">
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={historyFilterPurchasedBy} onValueChange={setHistoryFilterPurchasedBy}>
                                <SelectTrigger className="h-7 w-[130px] border-zinc-700 bg-zinc-950 text-zinc-100 text-[10px]">
                                    <SelectValue placeholder="Purchased by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs">
                                        All purchasers
                                    </SelectItem>
                                    {uniquePurchasers.map((p) => (
                                        <SelectItem key={p.value} value={p.value} className="text-xs">
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={historyFilterPayment} onValueChange={setHistoryFilterPayment}>
                                <SelectTrigger className="h-7 min-w-[150px] border-zinc-700 bg-zinc-950 text-zinc-100 text-[10px]">
                                    <SelectValue placeholder="Payment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs">
                                        All payment methods
                                    </SelectItem>
                                    {PAYMENT_METHODS.map((p) => (
                                        <SelectItem key={p.value} value={p.value} className="text-xs">
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="border-zinc-700/80 hover:bg-transparent">
                            <TableHead
                                className="text-zinc-400 h-8 px-3 text-[10px] cursor-pointer select-none hover:text-zinc-300 transition-colors"
                                onClick={() => setHistoryDateSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                            >
                                <span className="flex w-full items-center justify-between">
                                    Date
                                    {historyDateSortOrder === 'asc' ? (
                                        <ChevronUp className="size-3.5 shrink-0" />
                                    ) : (
                                        <ChevronDown className="size-3.5 shrink-0" />
                                    )}
                                </span>
                            </TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Item</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Category</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Qty</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Purchased From</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Payment</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Purchased By</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px] text-right">Cost</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedHistory.length === 0 ? (
                            <TableRow className="border-zinc-700/80">
                                <TableCell colSpan={8} className="text-zinc-400 py-4 text-center text-[11px]">
                                    No purchases match the selected filters
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedHistory.map((h) => (
                                <TableRow
                                    key={h.id}
                                    className="border-zinc-700/80 group transition-colors hover:!bg-zinc-700/50"
                                >
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] group-hover:text-zinc-300">
                                        {h.date}
                                    </TableCell>
                                    <TableCell className="text-zinc-200 px-3 py-1.5 text-[11px] font-medium group-hover:text-zinc-100">
                                        {h.name}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] group-hover:text-zinc-300">
                                        {SUPPLY_CATEGORIES.find((c) => c.value === h.category)?.label ?? h.category}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 tabular-nums text-[11px] group-hover:text-zinc-300">
                                        {h.quantity}
                                        {h.weight != null ? ` (${h.weight} lb)` : ''}
                                    </TableCell>
                                    <TableCell className="text-zinc-500 px-3 py-1.5 text-[11px] group-hover:text-zinc-400">
                                        {h.purchasedFrom}
                                    </TableCell>
                                    <TableCell className="text-zinc-500 px-3 py-1.5 text-[11px] group-hover:text-zinc-400">
                                        {PAYMENT_METHODS.find((p) => p.value === h.paymentMethod)?.label ??
                                            h.paymentMethod ??
                                            '—'}
                                    </TableCell>
                                    <TableCell className="text-zinc-500 px-3 py-1.5 text-[11px] group-hover:text-zinc-400">
                                        {h.purchasedBy ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-zinc-100 px-3 py-1.5 text-right tabular-nums text-[11px] font-medium group-hover:text-white">
                                        ${h.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {sortedFilteredHistory.length > 0 && (
                    <div className="flex items-center justify-between gap-4 border-t border-zinc-800/80 px-4 py-3">
                        <p className="text-zinc-500 text-xs">
                            Showing {(safeHistoryPage - 1) * HISTORY_PAGE_SIZE + 1}–
                            {Math.min(safeHistoryPage * HISTORY_PAGE_SIZE, sortedFilteredHistory.length)} of{' '}
                            {sortedFilteredHistory.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80 text-xs"
                                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                                disabled={safeHistoryPage <= 1}
                            >
                                <ChevronLeft className="size-3.5" />
                                Prev
                            </Button>
                            <span className="px-2 text-xs text-zinc-500">
                                Page {safeHistoryPage} of {historyTotalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80 text-xs"
                                onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
                                disabled={safeHistoryPage >= historyTotalPages}
                            >
                                Next
                                <ChevronRight className="size-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
                <DialogContent className="border-zinc-700/80 bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-black/30 sm:max-w-xl overflow-hidden">
                    <div
                        className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500/60 via-indigo-500/30 to-transparent"
                        aria-hidden
                    />
                    <DialogHeader className="pb-3 border-b border-zinc-800/80">
                        <DialogTitle className="text-zinc-100 text-base font-semibold tracking-tight">
                            Add Supply
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 text-xs mt-0.5">
                            Log a new supply with details and purchase info
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddSupply} className="pt-3 space-y-4">
                        {/* Item Details — single row */}
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_minmax(0,8rem)] gap-3">
                            <div>
                                <Label className="text-zinc-500 text-[11px] font-medium">Name</Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Beef Brisket, Vacuum Bags"
                                    className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                                />
                            </div>
                            <div>
                                <Label className="text-zinc-500 text-[11px] font-medium">Category</Label>
                                <Select
                                    value={form.category}
                                    onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                                >
                                    <SelectTrigger className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SUPPLY_CATEGORIES.map((c) => (
                                            <SelectItem key={c.value} value={c.value} className="text-sm">
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Quantity & Cost — one row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                                <Label className="text-zinc-500 text-[11px] font-medium">Qty</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={form.quantity}
                                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                                    placeholder="50"
                                    className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                                />
                            </div>
                            <div>
                                <Label className="text-zinc-500 text-[11px] font-medium">Weight (lb)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={form.weight}
                                    onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                                    placeholder="—"
                                    className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                                />
                            </div>
                            <div>
                                <Label className="text-zinc-500 text-[11px] font-medium">Unit</Label>
                                <Select value={form.unit} onValueChange={(v) => setForm((f) => ({ ...f, unit: v }))}>
                                    <SelectTrigger className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lb" className="text-sm">
                                            lb
                                        </SelectItem>
                                        <SelectItem value="pcs" className="text-sm">
                                            pcs
                                        </SelectItem>
                                        <SelectItem value="ea" className="text-sm">
                                            ea
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-zinc-500 text-[11px] font-medium">Unit Cost ($)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={form.unitCost}
                                    onChange={(e) => setForm((f) => ({ ...f, unitCost: e.target.value }))}
                                    placeholder="0.00"
                                    className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20 tabular-nums"
                                />
                            </div>
                        </div>

                        {/* Purchase Info — two rows */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Label className="text-zinc-500 text-[11px] font-medium">Purchase Date</Label>
                                <Input
                                    type="date"
                                    value={form.purchaseDate}
                                    onChange={(e) => setForm((f) => ({ ...f, purchaseDate: e.target.value }))}
                                    className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20 [color-scheme:dark]"
                                />
                            </div>
                            <div>
                                <Label className="text-zinc-500 text-[11px] font-medium">Purchased From</Label>
                                <Input
                                    value={form.purchasedFrom}
                                    onChange={(e) => setForm((f) => ({ ...f, purchasedFrom: e.target.value }))}
                                    placeholder="e.g. Restaurant Depot, Costco"
                                    className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                                />
                            </div>
                            <div>
                                <Label className="text-zinc-500 text-[11px] font-medium">Payment Method</Label>
                                <Select
                                    value={form.paymentMethod}
                                    onValueChange={(v) => setForm((f) => ({ ...f, paymentMethod: v }))}
                                >
                                    <SelectTrigger className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PAYMENT_METHODS.map((p) => (
                                            <SelectItem key={p.value} value={p.value} className="text-sm">
                                                {p.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-zinc-500 text-[11px] font-medium">Purchased By</Label>
                                <Input
                                    value={form.purchasedBy}
                                    onChange={(e) => setForm((f) => ({ ...f, purchasedBy: e.target.value }))}
                                    placeholder="e.g. John, Maria"
                                    className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-2 gap-2 sm:gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setAddModalOpen(false)}
                                className="border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 text-sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                className="bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 text-sm font-medium"
                            >
                                Add Supply
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Supply Modal */}
            <Dialog
                open={editModalOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditModalOpen(false);
                        setEditingSupply(null);
                    }
                }}
            >
                <DialogContent className="border-zinc-700/80 bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-black/30 sm:max-w-xl overflow-hidden">
                    <div
                        className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500/60 via-amber-500/30 to-transparent"
                        aria-hidden
                    />
                    <DialogHeader className="pb-3 border-b border-zinc-800/80">
                        <DialogTitle className="text-zinc-100 text-base font-semibold tracking-tight">
                            Edit Supply
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 text-xs mt-0.5">
                            Update supply details and purchase info
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateSupply} className="pt-3 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_minmax(0,8rem)] gap-3">
                            <div>
                                <Label className="text-zinc-500 text-[11px] font-medium">Name</Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Beef Brisket"
                                    className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                                />
                            </div>
                            <div>
                                <Label className="text-zinc-500 text-[11px] font-medium">Category</Label>
                                <Select
                                    value={form.category}
                                    onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                                >
                                    <SelectTrigger className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SUPPLY_CATEGORIES.map((c) => (
                                            <SelectItem key={c.value} value={c.value} className="text-sm">
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                                <Label className="text-zinc-500 text-[11px] font-medium">Qty</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={form.quantity}
                                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                                    placeholder="50"
                                    className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                                />
                            </div>
                            <div>
                                <Label className="text-zinc-500 text-[11px] font-medium">Weight (lb)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={form.weight}
                                    onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                                    placeholder="—"
                                    className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                                />
                            </div>
                            <div>
                                <Label className="text-zinc-500 text-[11px] font-medium">Unit</Label>
                                <Select value={form.unit} onValueChange={(v) => setForm((f) => ({ ...f, unit: v }))}>
                                    <SelectTrigger className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lb" className="text-sm">
                                            lb
                                        </SelectItem>
                                        <SelectItem value="pcs" className="text-sm">
                                            pcs
                                        </SelectItem>
                                        <SelectItem value="ea" className="text-sm">
                                            ea
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-zinc-500 text-[11px] font-medium">Unit Cost ($)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={form.unitCost}
                                    onChange={(e) => setForm((f) => ({ ...f, unitCost: e.target.value }))}
                                    placeholder="0.00"
                                    className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20 tabular-nums"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Label className="text-zinc-500 text-[11px] font-medium">Purchase Date</Label>
                                <Input
                                    type="date"
                                    value={form.purchaseDate}
                                    onChange={(e) => setForm((f) => ({ ...f, purchaseDate: e.target.value }))}
                                    className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20 [color-scheme:dark]"
                                />
                            </div>
                            <div>
                                <Label className="text-zinc-500 text-[11px] font-medium">Purchased From</Label>
                                <Input
                                    value={form.purchasedFrom}
                                    onChange={(e) => setForm((f) => ({ ...f, purchasedFrom: e.target.value }))}
                                    placeholder="e.g. Restaurant Depot"
                                    className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                                />
                            </div>
                            <div>
                                <Label className="text-zinc-500 text-[11px] font-medium">Payment Method</Label>
                                <Select
                                    value={form.paymentMethod}
                                    onValueChange={(v) => setForm((f) => ({ ...f, paymentMethod: v }))}
                                >
                                    <SelectTrigger className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PAYMENT_METHODS.map((p) => (
                                            <SelectItem key={p.value} value={p.value} className="text-sm">
                                                {p.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-zinc-500 text-[11px] font-medium">Purchased By</Label>
                                <Input
                                    value={form.purchasedBy}
                                    onChange={(e) => setForm((f) => ({ ...f, purchasedBy: e.target.value }))}
                                    placeholder="e.g. John, Maria"
                                    className="mt-1 h-9 border-zinc-700/80 bg-zinc-950/80 text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                                />
                            </div>
                        </div>
                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setEditModalOpen(false);
                                    setEditingSupply(null);
                                }}
                                className="border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 text-sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                className="bg-amber-600 text-white hover:bg-amber-500 shadow-lg shadow-amber-500/20 text-sm font-medium"
                            >
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <Dialog
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteModalOpen(false);
                        setSupplyToDelete(null);
                    }
                }}
            >
                <DialogContent className="border-zinc-700/80 bg-zinc-900/95 sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-100 text-base">Delete Supply</DialogTitle>
                        <DialogDescription className="text-zinc-500 text-sm">
                            Are you sure you want to delete{' '}
                            <strong className="text-zinc-300">{supplyToDelete?.name}</strong>? This will remove it from
                            the supply list. Purchase history will be kept for records.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-2 pt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setSupplyToDelete(null);
                            }}
                            className="border-zinc-700 text-zinc-400"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleDeleteSupply}
                            className="bg-red-600 hover:bg-red-500 text-white"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
