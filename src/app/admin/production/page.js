'use client';

import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Flame,
    Plus,
    Package,
    Scale,
    TrendingUp,
    DollarSign,
    Search,
    CalendarDays,
    MoreHorizontal,
    Download,
    Eye,
    Pencil,
    Trash2,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { submitProductionBatch } from '@/app/actions/submitProductionBatch';
import { getSuppliers } from '@/app/actions/getSuppliers';
import { getBatches } from '@/app/actions/getBatches';
import { deleteBatch } from '@/app/actions/deleteBatch';
import { updateBatch } from '@/app/actions/updateBatch';
import { handleDamagedGoods } from '@/app/actions/handleDamagedGoods';
import { useTransition } from 'react';

const COST_PER_LB = 8.5;
const MAX_YIELD_RATE = 0.6;

function getYieldBadgeConfig(yieldPercent) {
    if (yieldPercent === null || yieldPercent === undefined) {
        return {
            label: '—',
            className: 'border-zinc-600/30 bg-zinc-600/10 text-zinc-500',
        };
    }
    if (yieldPercent >= 40) {
        return {
            label: `${yieldPercent}%`,
            className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        };
    }
    if (yieldPercent >= 30) {
        return {
            label: `${yieldPercent}%`,
            className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
        };
    }
    return {
        label: `${yieldPercent}%`,
        className: 'border-red-500/30 bg-red-500/10 text-red-400',
    };
}

function formatCurrency(n) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(n ?? 0);
}

function escapeCsv(val) {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

function isProcessingStatus(status) {
    if (!status) return false;
    const s = String(status).toLowerCase();
    return s === 'pending' || s === 'processing' || s === 'partial_damaged' || s === 'partial';
}

function getStatusConfig(status) {
    if (status == null || status === '') {
        return { label: '—', className: 'text-zinc-500' };
    }
    const s = String(status).toLowerCase();
    if (isProcessingStatus(status)) {
        return { label: 'Processing', className: 'text-amber-400' };
    }
    if (s === 'damaged' || s === 'full_damaged') {
        return { label: 'Damaged', className: 'text-red-400' };
    }
    if (s === 'finished' || s === 'completed') {
        return { label: 'Finished', className: 'text-emerald-400' };
    }
    const label = s.charAt(0).toUpperCase() + s.slice(1);
    return { label, className: 'text-zinc-400' };
}

const PAGE_SIZE = 5;

export default function ProductionDashboard() {
    const [batches, setBatches] = React.useState([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('all');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
    const [convertDialogOpen, setConvertDialogOpen] = React.useState(false);
    const [selectedBatch, setSelectedBatch] = React.useState(null);
    const [dateRangeOpen, setDateRangeOpen] = React.useState(false);

    const [newSupplier, setNewSupplier] = React.useState('');
    const [newRawWeight, setNewRawWeight] = React.useState('');
    const [newCost, setNewCost] = React.useState('');
    const [newSupplierName, setNewSupplierName] = React.useState('');
    const [newSupplierAddress, setNewSupplierAddress] = React.useState('');
    const [newSupplierPhone, setNewSupplierPhone] = React.useState('');
    const [newSupplierEmail, setNewSupplierEmail] = React.useState('');
    const [supplierNameError, setSupplierNameError] = React.useState('');
    const [supplierPhoneError, setSupplierPhoneError] = React.useState('');
    const [supplierEmailError, setSupplierEmailError] = React.useState('');

    const isNewSupplier = newSupplier === '__new__';

    const validateSupplierName = (value) => {
        if (/\d/.test(value)) {
            setSupplierNameError('Name cannot contain numbers');
            return false;
        }
        setSupplierNameError('');
        return true;
    };

    const validateSupplierPhone = (value) => {
        if (value && /[a-zA-Z]/.test(value)) {
            setSupplierPhoneError('Phone cannot contain letters');
            return false;
        }
        setSupplierPhoneError('');
        return true;
    };

    const validateSupplierEmail = (value) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setSupplierEmailError('Please enter a valid email');
            return false;
        }
        setSupplierEmailError('');
        return true;
    };

    const isNewSupplierValid = !isNewSupplier || (
        newSupplierName.trim() &&
        !supplierNameError &&
        !supplierPhoneError &&
        !supplierEmailError &&
        (!newSupplierEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newSupplierEmail)) &&
        (!newSupplierPhone || !/[a-zA-Z]/.test(newSupplierPhone))
    );

    const [convertYield, setConvertYield] = React.useState('');
    const [convertProduct, setConvertProduct] = React.useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [batchToDelete, setBatchToDelete] = React.useState(null);
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const [batchToEdit, setBatchToEdit] = React.useState(null);
    const [editRawWeight, setEditRawWeight] = React.useState('');
    const [editCostPerPound, setEditCostPerPound] = React.useState('');
    const [damagedDialogOpen, setDamagedDialogOpen] = React.useState(false);
    const [batchToDamage, setBatchToDamage] = React.useState(null);
    const [damagedType, setDamagedType] = React.useState('full');
    const [damagedWeight, setDamagedWeight] = React.useState('');
    const [damagedReason, setDamagedReason] = React.useState('');
    const [confirmBatchOpen, setConfirmBatchOpen] = React.useState(false);
    const [toastVisible, setToastVisible] = React.useState(false);
    const [deleteToastVisible, setDeleteToastVisible] = React.useState(false);
    const [deleteToastMessage, setDeleteToastMessage] = React.useState('');
    const [editToastVisible, setEditToastVisible] = React.useState(false);
    const [editToastMessage, setEditToastMessage] = React.useState('');
    const [damagedToastVisible, setDamagedToastVisible] = React.useState(false);
    const [damagedToastMessage, setDamagedToastMessage] = React.useState('');

    const [state, formAction] = React.useActionState(submitProductionBatch, null);
    const createBatchFormRef = React.useRef(null);

    const [suppliers, setSuppliers] = React.useState([]);

    React.useEffect(() => {
        getBatches().then(setBatches);
    }, []);

    React.useEffect(() => {
        getSuppliers().then(setSuppliers);
    }, []);

    const costPerPound = newCost && parseFloat(newCost) >= 0 ? parseFloat(newCost) : COST_PER_LB;
    const supplierName = isNewSupplier
        ? newSupplierName
        : (suppliers.find((s) => s.supplier_id === newSupplier)?.name ?? newSupplier);
    const confirmSummary =
        newSupplier && newRawWeight
            ? `Confirming: ${parseFloat(newRawWeight).toFixed(1)} lbs from ${supplierName} at ${formatCurrency(costPerPound)}/lb. `
            : '';

    React.useEffect(() => {
        if (state?.success) {
            setCreateDialogOpen(false);
            setConfirmBatchOpen(false);
            setNewSupplier('');
            setNewRawWeight('');
            setNewCost('');
            setNewSupplierName('');
            setNewSupplierAddress('');
            setNewSupplierPhone('');
            setNewSupplierEmail('');
            getBatches().then(setBatches);
            setToastVisible(true);
            const t = setTimeout(() => setToastVisible(false), 4000);
            return () => clearTimeout(t);
        } else {
            setToastVisible(false);
        }
    }, [state]);

    React.useEffect(() => {
        if (createDialogOpen) setToastVisible(false);
    }, [createDialogOpen]);

    const filteredBatches = React.useMemo(() => {
        let result = batches;

        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            const batchId = (b) => (b.batch_number ?? b.id ?? '').toString().toLowerCase();
            const supplierName = (b) => (b.suppliers?.name ?? '').toLowerCase();
            result = result.filter((b) => batchId(b).includes(q) || supplierName(b).includes(q));
        }

        if (statusFilter !== 'all') {
            if (statusFilter === 'pending') {
                result = result.filter((b) => isProcessingStatus(b.tracking_status));
            } else {
                result = result.filter((b) => b.tracking_status?.toLowerCase() === statusFilter.toLowerCase());
            }
        }

        return result;
    }, [batches, searchTerm, statusFilter]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredBatches.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedBatches = filteredBatches.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const mtdThroughput = batches.reduce((sum, b) => sum + b.raw_weight, 0);
    const avgYield = React.useMemo(() => {
        const finished = batches.filter((b) => b.yield_percent !== null);
        if (finished.length === 0) return 0;
        return (finished.reduce((sum, b) => sum + b.yield_percent, 0) / finished.length).toFixed(1);
    }, [batches]);
    const mtdCost = batches.reduce((sum, b) => sum + b.total_cost, 0);

    const maxYieldBags = selectedBatch ? Math.floor(selectedBatch.raw_weight * MAX_YIELD_RATE) : 0;

    const yieldExceedsCapacity = selectedBatch && convertYield && parseInt(convertYield, 10) > maxYieldBags;

    const calculatedYieldPercent =
        selectedBatch && convertYield
            ? Math.round((parseInt(convertYield, 10) / selectedBatch.raw_weight) * 100)
            : null;

    const handleExportCsv = () => {
        const headers = [
            'Batch ID',
            'Supplier',
            'Raw Weight (lbs)',
            'Cost',
            'Status',
            'Cost / lb',
            'Yield %',
            'Created At',
        ];

        const rows = filteredBatches.map((batch) => {
            return [
                batch.batch_number ?? batch.id,
                batch.suppliers?.name ?? '',
                batch.raw_weight.toFixed(1),
                formatCurrency(batch.total_cost),
                formatCurrency(batch.cost_per_lb),
                batch.tracking_status ? getStatusConfig(batch.tracking_status).label : '—',
                batch.yield_percent !== null ? `${batch.yield_percent}%` : '—',
                batch.created_at,
            ]
                .map(escapeCsv)
                .join(',');
        });

        const csv = [headers.map(escapeCsv).join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `production-batches-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const openConvertDialog = (batch) => {
        setSelectedBatch(batch);
        setConvertYield('');
        setConvertProduct('');
        setConvertDialogOpen(true);
    };

    const openEditDialog = (batch) => {
        setBatchToEdit(batch);
        setEditRawWeight(String(batch.raw_weight ?? ''));
        setEditCostPerPound(String(batch.cost_per_pound ?? ''));
        setEditDialogOpen(true);
    };

    const openDamagedDialog = (batch) => {
        setBatchToDamage(batch);
        setDamagedType('full');
        setDamagedWeight('');
        setDamagedReason('');
        setDamagedDialogOpen(true);
    };

    // Inside your Client Component (Modal)
    const [isPending, startTransition] = useTransition();

    const onConfirm = () => {
        if (!batchToDamage) return;
        
        const batchNumber = batchToDamage.batch_number;
        const weight = damagedType === 'full' ? batchToDamage.raw_weight : parseFloat(damagedWeight);
        const isPartial = damagedType === 'partial';
        const productionId = batchToDamage.production_id;

        startTransition(async () => {
            const result = await handleDamagedGoods(productionId, weight, damagedReason);

            if (result.success) {
                setDamagedDialogOpen(false);
                setBatchToDamage(null);
                setDamagedType('full');
                setDamagedWeight('');
                setDamagedReason('');
                const freshBatches = await getBatches();
                setBatches(freshBatches);
                const toastMsg = isPartial
                    ? `Batch ${batchNumber} partially damaged (${weight} lbs)`
                    : `Batch ${batchNumber} marked as damaged`;
                setDamagedToastMessage(toastMsg);
                setDamagedToastVisible(true);
                setTimeout(() => setDamagedToastVisible(false), 4000);
            } else {
                console.error(result.message);
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-zinc-100 text-xl font-semibold tracking-tight">Production Command Center</h1>
                    <p className="text-zinc-400 mt-0.5 text-sm">Real-time operations visibility & batch management</p>
                </div>
                <Button
                    size="sm"
                    className="gap-1.5 bg-indigo-600 text-white hover:bg-indigo-500 text-xs"
                    onClick={() => setCreateDialogOpen(true)}
                >
                    <Plus className="size-4" />
                    Create Batch
                </Button>
            </div>

            {toastVisible && state?.success && (
                <div
                    className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right fade-in-0 duration-300 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 shadow-lg"
                    role="status"
                >
                    {state.message}
                </div>
            )}

            {deleteToastVisible && (
                <div
                    className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right fade-in-0 duration-300 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 shadow-lg"
                    role="status"
                >
                    {deleteToastMessage}
                </div>
            )}

            {editToastVisible && (
                <div
                    className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right fade-in-0 duration-300 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 shadow-lg"
                    role="status"
                >
                    {editToastMessage}
                </div>
            )}

            {damagedToastVisible && (
                <div
                    className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right fade-in-0 duration-300 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400 shadow-lg"
                    role="status"
                >
                    {damagedToastMessage}
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-lg border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <Scale className="size-4 text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">MTD Throughput</p>
                        <p className="text-sm font-semibold text-zinc-100 tabular-nums">
                            {mtdThroughput.toLocaleString()} lbs
                            <span className="text-emerald-400 text-[10px] font-normal ml-1.5">+12.5%</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <TrendingUp className="size-4 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Avg Yield</p>
                        <p className="text-sm font-semibold text-zinc-100 tabular-nums">
                            {avgYield}%
                            <span className="text-amber-400 text-[10px] font-normal ml-1.5">-2.1% vs target</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <DollarSign className="size-4 text-violet-400 shrink-0" />
                    <div className="min-w-0">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">MTD Cost</p>
                        <p className="text-sm font-semibold text-zinc-100 tabular-nums">
                            {formatCurrency(mtdCost)}
                            <span className="text-zinc-500 text-[10px] font-normal ml-1.5">
                                ${(mtdCost / mtdThroughput).toFixed(2)}/lb
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters & Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                        <Input
                            placeholder="Search Batch ID or Supplier..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-9 border-zinc-700 bg-zinc-900/80 pl-10 text-sm text-zinc-100 placeholder:text-zinc-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-9 w-full sm:w-40 border-zinc-700 bg-zinc-900/80 text-zinc-100">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="border-zinc-700 bg-zinc-900 text-zinc-100">
                            <SelectItem value="all" className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100">
                                All Status
                            </SelectItem>
                            <SelectItem value="pending" className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100">
                                Processing
                            </SelectItem>
                            <SelectItem value="damaged" className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100">
                                Damaged
                            </SelectItem>
                            <SelectItem value="finished" className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100">
                                Finished
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Date Range */}
                    <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 gap-2 border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                            >
                                <CalendarDays className="size-4" />
                                <span className="hidden sm:inline">Date Range</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 border-zinc-700 bg-zinc-900 p-4" align="start">
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-zinc-200">Select Date Range</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Today', 'Last 7 Days', 'Last 30 Days', 'This Month'].map((preset) => (
                                        <Button
                                            key={preset}
                                            variant="outline"
                                            size="sm"
                                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                            onClick={() => setDateRangeOpen(false)}
                                        >
                                            {preset}
                                        </Button>
                                    ))}
                                </div>
                                <div className="border-t border-zinc-700 pt-3">
                                    <p className="text-xs text-zinc-500 text-center">Calendar picker placeholder</p>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Export */}
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                    onClick={handleExportCsv}
                >
                    <Download className="size-4" />
                    Export
                </Button>
            </div>

            {/* Data Table */}
            <div className="overflow-hidden rounded-lg border border-zinc-700/80">
                <div className="border-b border-zinc-700/80 bg-zinc-900/80 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Flame className="size-4 text-amber-400" />
                            <h2 className="text-sm font-medium text-zinc-100">Production Batches</h2>
                            <span className="rounded-full bg-zinc-700/50 px-2 py-0.5 text-xs text-zinc-400">
                                {filteredBatches.length}
                            </span>
                        </div>
                        <div className="hidden sm:flex items-center gap-4 text-[10px]">
                            <span className="flex items-center gap-1.5">
                                <span className="size-2 rounded-full bg-emerald-500" />
                                <span className="text-zinc-400">≥40%</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="size-2 rounded-full bg-amber-500" />
                                <span className="text-zinc-400">30-39%</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="size-2 rounded-full bg-red-500" />
                                <span className="text-zinc-400">&lt;30%</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-700/80 hover:!bg-transparent">
                                <TableHead className="text-zinc-400 h-10 px-4 text-xs font-medium">
                                    <button className="flex items-center gap-1 hover:text-zinc-200 transition-colors">
                                        Batch ID
                                        <ArrowUpDown className="size-3" />
                                    </button>
                                </TableHead>
                                <TableHead className="text-zinc-400 h-10 px-4 text-xs font-medium hidden md:table-cell">
                                    Supplier
                                </TableHead>
                                <TableHead className="text-zinc-400 h-10 px-4 text-xs font-medium">
                                    Raw Weight
                                </TableHead>
                                <TableHead className="text-zinc-400 h-10 px-4 text-xs font-medium hidden sm:table-cell">
                                    Cost / lb
                                </TableHead>
                                <TableHead className="text-zinc-400 h-10 px-4 text-xs font-medium">Yield %</TableHead>
                                <TableHead className="text-zinc-400 h-10 px-4 text-xs font-medium">Status</TableHead>
                                <TableHead className="text-zinc-400 h-10 px-4 text-xs font-medium hidden xl:table-cell">
                                    Total Cost
                                </TableHead>
                                <TableHead className="text-zinc-400 h-10 px-4 text-xs font-medium text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedBatches.length === 0 ? (
                                <TableRow
                                    key="empty"
                                    className="border-zinc-700/80 cursor-default hover:!bg-transparent"
                                >
                                    <TableCell colSpan={8} className="text-zinc-400 py-12 text-center text-sm">
                                        No batches found matching your filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedBatches.map((batch) => {
                                    const statusConfig = getStatusConfig(batch.tracking_status);
                                    const yieldConfig = getYieldBadgeConfig(batch.yield_percent);

                                    return (
                                        <TableRow
                                            key={batch.production_id ?? batch.id ?? batch.batch_number}
                                            className="group border-zinc-700/80 transition-colors hover:!bg-zinc-800/50"
                                        >
                                            <TableCell className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-sm font-medium text-zinc-200">
                                                        {batch.batch_number}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500 md:hidden">
                                                        {batch.suppliers.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 hidden md:table-cell">
                                                <span className="text-sm text-zinc-300">{batch.suppliers.name}</span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <span className="text-sm text-zinc-100 tabular-nums">
                                                    {batch.raw_weight.toFixed(1)} lbs
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 hidden sm:table-cell">
                                                <span className="text-sm text-zinc-300 tabular-nums">
                                                    {formatCurrency(batch.cost_per_pound)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums',
                                                        yieldConfig.className,
                                                    )}
                                                >
                                                    {yieldConfig.label}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <span className={cn('text-sm', statusConfig.className)}>
                                                    {statusConfig.label}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 hidden xl:table-cell">
                                                <span className="text-sm text-zinc-300 tabular-nums">
                                                    ${(batch.initial_weight * batch.cost_per_pound).toFixed(2)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-right">
                                                {batch.tracking_status?.toLowerCase() !== 'damaged' && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700"
                                                            >
                                                                <MoreHorizontal className="size-4" />
                                                                <span className="sr-only">Actions</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="end"
                                                            className="w-52 border-zinc-700 bg-zinc-900"
                                                        >
                                                            {batch.tracking_status &&
                                                                batch.tracking_status?.toLowerCase() !== 'finished' && (
                                                                    <DropdownMenuItem
                                                                        className={cn(
                                                                            'cursor-pointer',
                                                                            batch.tracking_status?.toLowerCase() === 'smoking' ||
                                                                                batch.tracking_status?.toLowerCase() === 'drying'
                                                                                ? 'bg-amber-500/10 text-amber-400 font-medium focus:bg-amber-500/20 focus:text-amber-300'
                                                                                : 'text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100',
                                                                        )}
                                                                        onClick={() => openConvertDialog(batch)}
                                                                    >
                                                                        <Package className="size-4 mr-2" />
                                                                        Convert to Finished Goods
                                                                    </DropdownMenuItem>
                                                                )}
                                                            {isProcessingStatus(batch.tracking_status) && (
                                                                <DropdownMenuItem
                                                                    className="text-zinc-200 cursor-pointer focus:bg-zinc-800 focus:text-zinc-100"
                                                                    onClick={() => openEditDialog(batch)}
                                                                >
                                                                    <Pencil className="size-4 mr-2" />
                                                                    Edit Batch Details
                                                                </DropdownMenuItem>
                                                            )}
                                                            {isProcessingStatus(batch.tracking_status) && (
                                                                <DropdownMenuItem
                                                                    className="text-amber-400 cursor-pointer focus:bg-amber-500/10 focus:text-amber-300"
                                                                    onClick={() => openDamagedDialog(batch)}
                                                                >
                                                                    <AlertTriangle className="size-4 mr-2" />
                                                                    Mark as Damaged
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator className="bg-zinc-700" />
                                                            <DropdownMenuItem
                                                                className="text-red-400 cursor-pointer focus:bg-red-500/10 focus:text-red-400"
                                                                onClick={() => {
                                                                    setBatchToDelete(batch);
                                                                    setDeleteDialogOpen(true);
                                                                }}
                                                            >
                                                                <Trash2 className="size-4 mr-2" />
                                                                Delete Batch
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {filteredBatches.length > 0 && (
                    <div className="flex items-center justify-between border-t border-zinc-700/80 bg-zinc-900/50 px-4 py-3">
                        <p className="text-xs text-zinc-500">
                            Showing {(safePage - 1) * PAGE_SIZE + 1}–
                            {Math.min(safePage * PAGE_SIZE, filteredBatches.length)} of {filteredBatches.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={safePage <= 1}
                            >
                                <ChevronLeft className="size-4" />
                            </Button>
                            <span className="px-3 text-xs text-zinc-500">
                                {safePage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={safePage >= totalPages}
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Batch Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
                    <form ref={createBatchFormRef} onSubmit={() => setConfirmBatchOpen(false)} action={formAction}>
                        <input type="hidden" name="yieldPercent" value="0" />
                        <DialogHeader>
                            <DialogTitle className="text-zinc-100">Create New Batch</DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                Add a new raw batch to production tracking.
                            </DialogDescription>
                        </DialogHeader>
                        {state && !state.success && (
                            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {state.message}
                            </div>
                        )}
                        <div className="space-y-6 py-6">
                            <div className="space-y-2.5">
                                <label className="text-sm font-medium text-zinc-300">Supplier</label>
                                <select
                                    name="supplierId"
                                    value={newSupplier}
                                    onChange={(e) => setNewSupplier(e.target.value)}
                                    className="flex h-9 w-full items-center justify-between rounded-md border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-500"
                                >
                                    <option value="">Select supplier</option>
                                    {suppliers.map((supplier) => (
                                        <option key={supplier.supplier_id} value={supplier.supplier_id}>
                                            {supplier.name}
                                        </option>
                                    ))}
                                    <option value="__new__">Add new supplier</option>
                                </select>
                            </div>
                            {isNewSupplier && (
                                <div className="space-y-5 rounded-lg border border-zinc-700/80 bg-zinc-800/50 p-5">
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                        New supplier details
                                    </p>
                                    <div className="grid gap-5">
                                        <div className="space-y-2.5">
                                            <label className="text-sm font-medium text-zinc-300">Name</label>
                                            <Input
                                                name="newSupplierName"
                                                value={newSupplierName}
                                                onChange={(e) => {
                                                    setNewSupplierName(e.target.value);
                                                    validateSupplierName(e.target.value);
                                                }}
                                                placeholder="Supplier name"
                                                className={cn(
                                                    "border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500",
                                                    supplierNameError && "border-red-500"
                                                )}
                                            />
                                            {supplierNameError && (
                                                <p className="text-xs text-red-400">{supplierNameError}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-sm font-medium text-zinc-300">Address</label>
                                            <Input
                                                name="newSupplierAddress"
                                                value={newSupplierAddress}
                                                onChange={(e) => setNewSupplierAddress(e.target.value)}
                                                placeholder="Street address"
                                                className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-2.5">
                                                <label className="text-sm font-medium text-zinc-300">Phone</label>
                                                <Input
                                                    name="newSupplierPhone"
                                                    type="tel"
                                                    value={newSupplierPhone}
                                                    onChange={(e) => {
                                                        setNewSupplierPhone(e.target.value);
                                                        validateSupplierPhone(e.target.value);
                                                    }}
                                                    placeholder="(555) 555-5555"
                                                    className={cn(
                                                        "border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500",
                                                        supplierPhoneError && "border-red-500"
                                                    )}
                                                />
                                                {supplierPhoneError && (
                                                    <p className="text-xs text-red-400">{supplierPhoneError}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="text-sm font-medium text-zinc-300">Email</label>
                                                <Input
                                                    name="newSupplierEmail"
                                                    type="email"
                                                    value={newSupplierEmail}
                                                    onChange={(e) => {
                                                        setNewSupplierEmail(e.target.value);
                                                        validateSupplierEmail(e.target.value);
                                                    }}
                                                    placeholder="email@example.com"
                                                    className={cn(
                                                        "border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500",
                                                        supplierEmailError && "border-red-500"
                                                    )}
                                                />
                                                {supplierEmailError && (
                                                    <p className="text-xs text-red-400">{supplierEmailError}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2.5">
                                    <label className="text-sm font-medium text-zinc-300">Raw Weight (lbs)</label>
                                    <Input
                                        name="rawWeight"
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        placeholder="e.g. 45.5"
                                        value={newRawWeight}
                                        onChange={(e) => setNewRawWeight(e.target.value)}
                                        className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-sm font-medium text-zinc-300">Cost Per Pound</label>
                                    <div className="flex h-10 items-center rounded-md border border-zinc-700 bg-zinc-900/80">
                                        <span className="pl-3 text-sm text-zinc-400">$</span>
                                        <Input
                                            name="costPerPound"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={newCost}
                                            onChange={(e) => setNewCost(e.target.value)}
                                            className="h-full flex-1 border-0 bg-transparent pr-3 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setCreateDialogOpen(false)}
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={!newRawWeight || !newSupplier || !isNewSupplierValid}
                                className="bg-indigo-600 text-white hover:bg-indigo-500"
                                type="button"
                                onClick={() => setConfirmBatchOpen(true)}
                            >
                                Submit Batch
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirm Batch Modal */}
            <Dialog open={confirmBatchOpen} onOpenChange={setConfirmBatchOpen}>
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-100">Confirm Batch</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Please confirm the batch details before submitting.
                        </DialogDescription>
                    </DialogHeader>
                    <p className="py-4 text-sm text-zinc-200">{confirmSummary}</p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmBatchOpen(false)}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            className="bg-indigo-600 text-white hover:bg-indigo-500"
                            onClick={() => {
                                setConfirmBatchOpen(false);
                                createBatchFormRef.current?.requestSubmit();
                            }}
                        >
                            Confirm & Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Batch Dialog */}
            <Dialog
                open={editDialogOpen}
                onOpenChange={(open) => {
                    setEditDialogOpen(open);
                    if (!open) setBatchToEdit(null);
                }}
            >
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-100">Edit Batch</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Edit batch details for the selected production batch.
                        </DialogDescription>
                    </DialogHeader>
                    {batchToEdit && (
                        <div className="space-y-5 py-4">
                            <div className="rounded-md border border-zinc-700/50 bg-zinc-800/50 px-3 py-2">
                                <p className="text-xs text-zinc-500">Batch</p>
                                <p className="font-mono text-sm text-zinc-200">{batchToEdit.batch_number}</p>
                                <p className="text-xs text-zinc-400">{batchToEdit.suppliers?.name ?? '—'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2.5">
                                    <label className="text-sm font-medium text-zinc-300">Raw Weight (lbs)</label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        value={editRawWeight}
                                        onChange={(e) => setEditRawWeight(e.target.value)}
                                        className="border-zinc-700 bg-zinc-900/80 text-zinc-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-sm font-medium text-zinc-300">Cost Per Pound</label>
                                    <div className="flex h-10 items-center rounded-md border border-zinc-700 bg-zinc-900/80">
                                        <span className="pl-3 text-sm text-zinc-400">$</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={editCostPerPound}
                                            onChange={(e) => setEditCostPerPound(e.target.value)}
                                            className="h-full flex-1 border-0 bg-transparent pr-3 text-zinc-100 focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setEditDialogOpen(false)}
                                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={async () => {
                                        const batchNumber = batchToEdit.batch_number;
                                        const result = await updateBatch(
                                            batchToEdit.production_id,
                                            parseFloat(editRawWeight),
                                            parseFloat(editCostPerPound),
                                        );
                                        if (result.success) {
                                            setEditDialogOpen(false);
                                            setBatchToEdit(null);
                                            const freshBatches = await getBatches();
                                            setBatches(freshBatches);
                                            setEditToastMessage(`Batch ${batchNumber} updated successfully`);
                                            setEditToastVisible(true);
                                            setTimeout(() => setEditToastVisible(false), 4000);
                                        }
                                    }}
                                    className="bg-indigo-600 text-white hover:bg-indigo-500"
                                >
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Mark as Damaged Dialog */}
            <Dialog
                open={damagedDialogOpen}
                onOpenChange={(open) => {
                    setDamagedDialogOpen(open);
                    if (!open) setBatchToDamage(null);
                }}
            >
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-100">Mark as Damaged</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Record damage for this production batch.
                        </DialogDescription>
                    </DialogHeader>
                    {batchToDamage && (
                        <div className="space-y-5 py-4">
                            <div className="rounded-md border border-zinc-700/50 bg-zinc-800/50 px-3 py-2">
                                <p className="text-xs text-zinc-500">Batch</p>
                                <p className="font-mono text-sm text-zinc-200">{batchToDamage.batch_number}</p>
                                <p className="text-xs text-zinc-400">
                                    {batchToDamage.raw_weight?.toFixed(1)} lbs — {batchToDamage.suppliers?.name ?? '—'}
                                </p>
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-sm font-medium text-zinc-300">Damage Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="damagedType"
                                            value="full"
                                            checked={damagedType === 'full'}
                                            onChange={() => setDamagedType('full')}
                                            className="size-4 accent-red-500"
                                        />
                                        <span className="text-sm text-zinc-200">Full Batch</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="damagedType"
                                            value="partial"
                                            checked={damagedType === 'partial'}
                                            onChange={() => setDamagedType('partial')}
                                            className="size-4 accent-amber-500"
                                        />
                                        <span className="text-sm text-zinc-200">Partial</span>
                                    </label>
                                </div>
                            </div>
                            {damagedType === 'partial' && (
                                <div className="space-y-2.5">
                                    <label className="text-sm font-medium text-zinc-300">
                                        Damaged Weight (lbs) <span className="text-red-400">*</span>
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        max={batchToDamage.raw_weight}
                                        placeholder={`Max: ${batchToDamage.raw_weight?.toFixed(1)}`}
                                        value={damagedWeight}
                                        onChange={(e) => setDamagedWeight(e.target.value)}
                                        required
                                        className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                    />
                                </div>
                            )}
                            <div className="space-y-2.5">
                                <label className="text-sm font-medium text-zinc-300">
                                    Reason <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={damagedReason}
                                    onChange={(e) => setDamagedReason(e.target.value)}
                                    placeholder="Describe the damage or cause..."
                                    rows={3}
                                    required
                                    className="flex w-full rounded-md border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-500 resize-none"
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setDamagedDialogOpen(false)}
                                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={onConfirm}
                                    disabled={
                                        isPending ||
                                        !damagedReason.trim() ||
                                        (damagedType === 'partial' &&
                                            (!damagedWeight || parseFloat(damagedWeight) <= 0)) ||
                                        (damagedType === 'partial' &&
                                            parseFloat(damagedWeight) > batchToDamage.raw_weight) // Extra Safety!
                                    }
                                    className="bg-red-600 text-white hover:bg-red-500"
                                >
                                    <AlertTriangle className="size-4 mr-1.5" />
                                    {isPending ? 'Processing...' : 'Mark as Damaged'}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Convert Dialog */}
            <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-100">Convert to Finished Goods</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Convert raw batch to finished inventory.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Source Details */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-1 border-b border-zinc-800">
                                <Scale className="size-4 text-zinc-500" />
                                <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                    Source Details
                                </h3>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-500">Batch ID</label>
                                    <div className="flex h-9 items-center rounded-md border border-zinc-700/50 bg-zinc-800/50 px-3">
                                        <span className="font-mono text-sm text-zinc-300">
                                            {selectedBatch?.id ?? '—'}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-500">Raw Weight</label>
                                    <div className="flex h-9 items-center rounded-md border border-zinc-700/50 bg-zinc-800/50 px-3">
                                        <span className="text-sm text-zinc-300 tabular-nums">
                                            {selectedBatch?.raw_weight.toFixed(1) ?? '—'} lbs
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-500">Cost / lb</label>
                                    <div className="flex h-9 items-center rounded-md border border-zinc-700/50 bg-zinc-800/50 px-3">
                                        <span className="text-sm text-zinc-300 tabular-nums">
                                            {selectedBatch ? formatCurrency(selectedBatch.cost_per_lb) : '—'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Conversion Data */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-1 border-b border-zinc-800">
                                <Package className="size-4 text-zinc-500" />
                                <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                    Conversion Data
                                </h3>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Finished Product</label>
                                    <Select value={convertProduct} onValueChange={setConvertProduct}>
                                        <SelectTrigger className="border-zinc-700 bg-zinc-900/80 text-zinc-100">
                                            <SelectValue placeholder="Select product" />
                                        </SelectTrigger>
                                        <SelectContent className="border-zinc-700 bg-zinc-900 text-zinc-100">
                                            <SelectItem
                                                value="premium-brisket"
                                                className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100"
                                            >
                                                Premium Brisket 12oz
                                            </SelectItem>
                                            <SelectItem
                                                value="seasoned-classic"
                                                className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100"
                                            >
                                                Seasoned Classic 8oz
                                            </SelectItem>
                                            <SelectItem
                                                value="original"
                                                className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100"
                                            >
                                                Original 6oz
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Finished Bags</label>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder={`Max: ${maxYieldBags}`}
                                            value={convertYield}
                                            onChange={(e) => setConvertYield(e.target.value)}
                                            className={cn(
                                                'border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]',
                                                yieldExceedsCapacity &&
                                                    'border-red-500/50 focus-visible:ring-red-500/30',
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">
                                            Total Finished Weight
                                        </label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            placeholder="e.g. 18.5 lbs"
                                            className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                        />
                                    </div>
                                </div>
                                {yieldExceedsCapacity && (
                                    <div className="flex items-center gap-1.5 text-red-400 text-xs">
                                        <AlertTriangle className="size-3.5" />
                                        <span>Exceeds max capacity of {maxYieldBags} bags.</span>
                                    </div>
                                )}

                                {convertYield && !yieldExceedsCapacity && (
                                    <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-zinc-400 text-xs">Calculated Yield Rate</span>
                                            <span
                                                className={cn(
                                                    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tabular-nums',
                                                    getYieldBadgeConfig(calculatedYieldPercent).className,
                                                )}
                                            >
                                                {calculatedYieldPercent}%
                                            </span>
                                        </div>
                                        <div className="mt-2 h-1.5 rounded-full bg-zinc-700 overflow-hidden">
                                            <div
                                                className={cn(
                                                    'h-full rounded-full transition-all',
                                                    calculatedYieldPercent >= 40
                                                        ? 'bg-emerald-500'
                                                        : calculatedYieldPercent >= 30
                                                          ? 'bg-amber-500'
                                                          : 'bg-red-500',
                                                )}
                                                style={{
                                                    width: `${Math.min(calculatedYieldPercent, 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConvertDialogOpen(false)}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={
                                !convertYield ||
                                !convertProduct ||
                                yieldExceedsCapacity ||
                                parseInt(convertYield, 10) <= 0
                            }
                            className="bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
                        >
                            <Package className="size-4 mr-1.5" />
                            Convert
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) setBatchToDelete(null);
                }}
            >
                {' '}
                <DialogContent className="bg-zinc-900 border-zinc-700 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-100 flex items-center gap-2">
                            <AlertTriangle className="size-5 text-red-400" />
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            This action cannot be undone. This will permanently delete the batch and all associated
                            data.
                        </DialogDescription>
                    </DialogHeader>

                    {batchToDelete && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 my-2">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Batch ID</span>
                                    <span className="font-mono text-zinc-200">{batchToDelete.batch_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Supplier</span>
                                    <span className="text-zinc-200">{batchToDelete.supplier_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Raw Weight</span>
                                    <span className="text-zinc-200">{batchToDelete.raw_weight.toFixed(1)} lbs</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Total Cost</span>
                                    <span className="text-zinc-200">{formatCurrency(batchToDelete.total_cost)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setBatchToDelete(null);
                            }}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={!batchToDelete}
                            onClick={async () => {
                                if (!batchToDelete) return;
                                const batchNumber = batchToDelete.batch_number;
                                const id = batchToDelete.production_id ?? batchToDelete.id;
                                setDeleteDialogOpen(false);
                                setBatchToDelete(null);
                                await deleteBatch(id);
                                await getBatches().then(setBatches);
                                setDeleteToastMessage(`Batch ${batchNumber} deleted successfully`);
                                setDeleteToastVisible(true);
                                setTimeout(() => setDeleteToastVisible(false), 4000);
                            }}
                            className="bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
                        >
                            <Trash2 className="size-4 mr-1.5" />
                            Delete Batch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
