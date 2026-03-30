'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import SuppliesKPIs from './SuppliesKPIs.jsx';
import SuppliesMonthlySpendChart from './SuppliesMonthlySpendChart.jsx';
import SuppliesItemsTable from './SuppliesItemsTable.jsx';
import SuppliesPurchaseHistoryTable from './SuppliesPurchaseHistoryTable.jsx';
import AddPurchaseDialog from './AddPurchaseDialog.jsx';
import AddSupplyDialog from './AddSupplyDialog.jsx';
import EditSupplyDialog from './EditSupplyDialog.jsx';
import DeleteSupplyDialog from './DeleteSupplyDialog.jsx';
import { Plus, Beef, Wrench, Box, Sparkles, Layers, Download } from 'lucide-react';
import { exportSuppliesToCsv } from '@/lib/utils/exportSupplies';
import { purchaseHistoryLineCost } from '@/lib/utils/purchaseHistoryLineCost';
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

function asSuppliesArray(prev) {
    return Array.isArray(prev) ? prev : [];
}

function purchaseHistoryHasDate(h) {
    return h?.date != null && String(h.date).trim() !== '';
}

function formatDate(d) {
    if (!d) return '—';
    const dt = new Date(String(d).slice(0, 10) + 'T00:00:00');
    const now = new Date();
    const diffDays = Math.floor((now - dt) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return dt.toLocaleDateString();
}

export default function SuppliesClient({ initialSupplies = [], initialPurchaseHistory = [], initialSuppliers = [] }) {
    const [addModalOpen, setAddModalOpen] = React.useState(false);
    const [editModalOpen, setEditModalOpen] = React.useState(false);
    const [editingSupply, setEditingSupply] = React.useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [supplyToDelete, setSupplyToDelete] = React.useState(null);
    const [supplies, setSupplies] = React.useState(initialSupplies);
    const [supplySearch, setSupplySearch] = React.useState('');
    const [supplyPage, setSupplyPage] = React.useState(1);

    const SUPPLY_PAGE_SIZE = 5;
    const [purchaseHistory, setPurchaseHistory] = React.useState(initialPurchaseHistory);
    const [purchaseModalOpen, setPurchaseModalOpen] = React.useState(false);

    const openEditModal = (supply) => {
        setEditingSupply(supply);
        setEditModalOpen(true);
    };

    const openDeleteModal = (supply) => {
        setSupplyToDelete(supply);
        setDeleteModalOpen(true);
    };

    const handleUpdateSupply = React.useCallback((updated, original) => {
        setSupplies((prev) => asSuppliesArray(prev).map((s) => (String(s.id) === String(original.id) ? updated : s)));
        setPurchaseHistory((prev) =>
            prev.map((h) =>
                h.supplyId != null && String(h.supplyId) === String(original.id)
                    ? { ...h, name: updated.name, category: updated.category }
                    : h,
            ),
        );
    }, []);

    const uniqueMonthsForMetrics = React.useMemo(() => {
        const withDate = purchaseHistory.filter(purchaseHistoryHasDate);
        const months = [...new Set(withDate.map((h) => String(h.date).slice(0, 7)))].sort().reverse();
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
    const [metricsDateRange, setMetricsDateRange] = React.useState({ from: undefined, to: undefined });
    const thisMonthPurchases = React.useMemo(() => {
        if (!metricsDateRange?.from) return purchaseHistory;
        return purchaseHistory.filter((h) => {
            if (!purchaseHistoryHasDate(h)) return false;
            const historyDate = new Date(h.date);
            const startOfDay = new Date(metricsDateRange.from);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = metricsDateRange.to ? new Date(metricsDateRange.to) : new Date(metricsDateRange.from);
            endOfDay.setHours(23, 59, 59, 999);
            return historyDate >= startOfDay && historyDate <= endOfDay;
        });
    }, [purchaseHistory, metricsDateRange]);
    const byCategory = React.useMemo(() => {
        const acc = { meat: 0, equipment: 0, packaging: 0, seasoning: 0, other: 0 };
        thisMonthPurchases.forEach((h) => {
            const cat = SUPPLY_CATEGORIES.some((c) => c.value === h.category) ? h.category : 'other';
            acc[cat] = (acc[cat] || 0) + purchaseHistoryLineCost(h);
        });
        return acc;
    }, [thisMonthPurchases]);
    const totalValue = Object.values(byCategory).reduce((a, b) => a + b, 0);

    const [historyFilterMonth, setHistoryFilterMonth] = React.useState('all');
    const [historyFilterSupply, setHistoryFilterSupply] = React.useState('all');
    const [historyFilterPurchasedBy, setHistoryFilterPurchasedBy] = React.useState('all');
    const [historyFilterPayment, setHistoryFilterPayment] = React.useState('all');
    const [historyDateSortOrder, setHistoryDateSortOrder] = React.useState('desc');
    const [historyPage, setHistoryPage] = React.useState(1);

    const HISTORY_PAGE_SIZE = 5;
    const uniqueMonths = uniqueMonthsForMetrics;

    const filteredSupplies = React.useMemo(() => {
        const list = supplies;
        if (!supplySearch.trim()) return list;
        const q = supplySearch.trim().toLowerCase();
        return list.filter((s) => {
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
        safeSupplyPage * SUPPLY_PAGE_SIZE,
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
            if (!purchaseHistoryHasDate(h)) return false;
            if (historyFilterMonth !== 'all' && String(h.date).slice(0, 7) !== historyFilterMonth) return false;
            if (historyFilterSupply !== 'all' && h.name !== historyFilterSupply) return false;
            if (historyFilterPurchasedBy !== 'all' && h.purchasedBy !== historyFilterPurchasedBy) return false;
            if (historyFilterPayment !== 'all' && h.paymentMethod !== historyFilterPayment) return false;
            return true;
        });
    }, [purchaseHistory, historyFilterMonth, historyFilterSupply, historyFilterPurchasedBy, historyFilterPayment]);

    const sortedFilteredHistory = React.useMemo(() => {
        return [...filteredHistory].sort((a, b) => {
            const da = String(a.date).localeCompare(String(b.date));
            return historyDateSortOrder === 'asc' ? da : -da;
        });
    }, [filteredHistory, historyDateSortOrder]);

    React.useEffect(
        () => setHistoryPage(1),
        [historyFilterMonth, historyFilterSupply, historyFilterPurchasedBy, historyFilterPayment],
    );

    const historyTotalPages = Math.max(1, Math.ceil(sortedFilteredHistory.length / HISTORY_PAGE_SIZE));
    const safeHistoryPage = Math.min(historyPage, historyTotalPages);
    const paginatedHistory = sortedFilteredHistory.slice(
        (safeHistoryPage - 1) * HISTORY_PAGE_SIZE,
        safeHistoryPage * HISTORY_PAGE_SIZE,
    );

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
                        onClick={() => exportSuppliesToCsv(filteredSupplies, SUPPLY_CATEGORIES, PAYMENT_METHODS)}
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

            <SuppliesKPIs
                date={metricsDateRange}
                onDateChange={setMetricsDateRange}
                totalValue={totalValue}
                byCategory={byCategory}
                categories={SUPPLY_CATEGORIES}
            />

            <SuppliesMonthlySpendChart purchaseHistory={purchaseHistory} />

            <SuppliesItemsTable
                categories={SUPPLY_CATEGORIES}
                supplySearch={supplySearch}
                onSupplySearchChange={setSupplySearch}
                paginatedSupplies={paginatedSupplies}
                filteredCount={filteredSupplies.length}
                pageSize={SUPPLY_PAGE_SIZE}
                currentPage={safeSupplyPage}
                totalPages={supplyTotalPages}
                onPageChange={setSupplyPage}
                formatDate={formatDate}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
            />

            <SuppliesPurchaseHistoryTable
                categories={SUPPLY_CATEGORIES}
                paymentMethods={PAYMENT_METHODS}
                monthOptions={uniqueMonths}
                supplyOptions={uniqueSupplies}
                purchaserOptions={uniquePurchasers}
                filterMonth={historyFilterMonth}
                onFilterMonthChange={setHistoryFilterMonth}
                filterSupply={historyFilterSupply}
                onFilterSupplyChange={setHistoryFilterSupply}
                filterPurchasedBy={historyFilterPurchasedBy}
                onFilterPurchasedByChange={setHistoryFilterPurchasedBy}
                filterPayment={historyFilterPayment}
                onFilterPaymentChange={setHistoryFilterPayment}
                dateSortOrder={historyDateSortOrder}
                onToggleDateSort={() => setHistoryDateSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                paginatedHistory={paginatedHistory}
                sortedFilteredCount={sortedFilteredHistory.length}
                pageSize={HISTORY_PAGE_SIZE}
                currentPage={safeHistoryPage}
                totalPages={historyTotalPages}
                onPageChange={setHistoryPage}
                headerAction={
                    <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        className="h-7 gap-1 border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 text-[10px] shrink-0"
                        onClick={() => setPurchaseModalOpen(true)}
                    >
                        <Plus className="size-3" />
                        Add purchase
                    </Button>
                }
            />

            <AddPurchaseDialog
                open={purchaseModalOpen}
                onOpenChange={setPurchaseModalOpen}
                supplies={supplies}
                suppliers={initialSuppliers}
                paymentMethods={PAYMENT_METHODS}
                onAddPurchase={(entry) => setPurchaseHistory((prev) => [entry, ...prev])}
            />

            <AddSupplyDialog
                open={addModalOpen}
                onOpenChange={setAddModalOpen}
                categories={SUPPLY_CATEGORIES}
                onAddSupply={(supply) => {
                    setSupplies((prev) => [supply, ...asSuppliesArray(prev)]);
                    setPurchaseHistory((prev) => [...prev]);
                }}
            />

            <EditSupplyDialog
                open={editModalOpen}
                supply={editingSupply}
                onOpenChange={(next) => {
                    setEditModalOpen(next);
                    if (!next) setEditingSupply(null);
                }}
                categories={SUPPLY_CATEGORIES}
                onUpdateSupply={handleUpdateSupply}
            />

            <DeleteSupplyDialog
                open={deleteModalOpen}
                onOpenChange={(next) => {
                    setDeleteModalOpen(next);
                    if (!next) setSupplyToDelete(null);
                }}
                supply={supplyToDelete}
                onDeleted={(supplyId) =>
                    setSupplies((prev) => asSuppliesArray(prev).filter((s) => String(s.id) !== supplyId))
                }
            />
        </div>
    );
}
