'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import SuppliesKPIs from './SuppliesKPIs.jsx';
import SuppliesMonthlySpendChart from './SuppliesMonthlySpendChart.jsx';
import SuppliesItemsTable from './SuppliesItemsTable.jsx';
import SuppliesPurchaseHistoryTable from './SuppliesPurchaseHistoryTable.jsx';
import AddPurchaseDialog from './AddPurchaseDialog.jsx';
import AddSupplyDialog from './AddSupplyDialog.jsx';
import EditSupplyDialog from './EditSupplyDialog.jsx';
import { Plus, Beef, Wrench, Box, Sparkles, Layers, Download } from 'lucide-react';
import { exportSuppliesToCsv } from '@/lib/utils/exportSupplies';

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

function asSuppliesArray(data) {
    return Array.isArray(data) ? data : [];
}

export default function SuppliesClient({ initialSupplies = [] }) {
    const [addModalOpen, setAddModalOpen] = React.useState(false);
    const [editModalOpen, setEditModalOpen] = React.useState(false);
    const [editingSupply, setEditingSupply] = React.useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [supplyToDelete, setSupplyToDelete] = React.useState(null);
    const [supplies, setSupplies] = React.useState(() => asSuppliesArray(initialSupplies));
    const [supplySearch, setSupplySearch] = React.useState('');
    const [supplyPage, setSupplyPage] = React.useState(1);

    const SUPPLY_PAGE_SIZE = 5;
    const [purchaseHistory, setPurchaseHistory] = React.useState(MOCK_PURCHASE_HISTORY);
    const [purchaseModalOpen, setPurchaseModalOpen] = React.useState(false);

    const uniqueSupplierNames = React.useMemo(() => {
        return [...new Set(purchaseHistory.map((h) => h.purchasedFrom).filter((s) => s && s !== '—'))].sort((a, b) =>
            a.localeCompare(b),
        );
    }, [purchaseHistory]);

    const openEditModal = (supply) => {
        setEditingSupply(supply);
        setEditModalOpen(true);
    };

    const openDeleteModal = (supply) => {
        setSupplyToDelete(supply);
        setDeleteModalOpen(true);
    };

    const handleDeleteSupply = () => {
        if (!supplyToDelete) return;
        setSupplies((prev) => asSuppliesArray(prev).filter((s) => s.id !== supplyToDelete.id));
        setSupplyToDelete(null);
        setDeleteModalOpen(false);
    };

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
    const [metricsDateRange, setMetricsDateRange] = React.useState({ from: undefined, to: undefined });
    const thisMonthPurchases = React.useMemo(() => {
        if (!metricsDateRange?.from) return purchaseHistory;
        return purchaseHistory.filter((h) => {
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
            acc[cat] = (acc[cat] || 0) + h.cost;
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
        const list = asSuppliesArray(supplies);
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
                supplierNames={uniqueSupplierNames}
                paymentMethods={PAYMENT_METHODS}
                onAddPurchase={(entry) => setPurchaseHistory((prev) => [entry, ...prev])}
            />

            <AddSupplyDialog
                open={addModalOpen}
                onOpenChange={setAddModalOpen}
                categories={SUPPLY_CATEGORIES}
                paymentMethods={PAYMENT_METHODS}
                onAddSupply={(supplyDraft, historyEntry) => {
                    setSupplies((prev) => {
                        const list = asSuppliesArray(prev);
                        const supply = { ...supplyDraft, id: `SUP-${list.length + 1}` };
                        return [supply, ...list];
                    });
                    setPurchaseHistory((prev) => [historyEntry, ...prev]);
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
                onSave={(updated, original) => {
                    setSupplies((prev) => asSuppliesArray(prev).map((s) => (s.id === original.id ? updated : s)));
                    setPurchaseHistory((prev) =>
                        prev.map((h) => {
                            if (h.name === original.name && h.date === original.lastPurchasedAt) {
                                return { ...h, name: updated.name, category: updated.category };
                            }
                            return h;
                        }),
                    );
                }}
            />

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
