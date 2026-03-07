'use client';

import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, formatCurrency, isProcessingStatus, getStatusConfig, getYieldBadgeConfig } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { exportBatchesToCsv } from '@/lib/utils/exportBatches';
import { getSuppliers } from '@/app/actions/getSuppliers';
import { getBatches } from '@/app/actions/getBatches';
import { getProducts } from '@/app/actions/getProducts';
import CreateBatchDialog from './_components/CreateBatchDialog.jsx';
import EditBatchDialog from './_components/EditBatchDialog.jsx';
import DamagedBatchDialog from './_components/DamagedBatchDialog.jsx';
import ConvertBatchDialog from './_components/ConvertBatchDialog.jsx';
import DeleteBatchDialog from './_components/DeleteBatchDialog.jsx';
import ProductionKPIs from './_components/ProductionKPIs.jsx';

const PAGE_SIZE = 10;

export default function ProductionDashboard() {
    const [batches, setBatches] = React.useState([]);
    const [products, setProducts] = React.useState([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('all');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [convertDialogOpen, setConvertDialogOpen] = React.useState(false);
    const [selectedBatch, setSelectedBatch] = React.useState(null);
    const [dateRange, setDateRange] = React.useState({ from: undefined, to: undefined });
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [batchToDelete, setBatchToDelete] = React.useState(null);
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const [batchToEdit, setBatchToEdit] = React.useState(null);
    const [damagedDialogOpen, setDamagedDialogOpen] = React.useState(false);
    const [batchToDamage, setBatchToDamage] = React.useState(null);
    const [suppliers, setSuppliers] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchBatches = async () => {
            setIsLoading(true);
            try {
                const data = await getBatches();
                setBatches(data ?? []);
            } catch (error) {
                console.error('Failed to fetch batches:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBatches();
    }, []);

    React.useEffect(() => {
        getSuppliers().then(setSuppliers);
    }, []);

    React.useEffect(() => {
        getProducts().then(setProducts);
    }, []);

    const filteredBatches = React.useMemo(() => {
        let result = batches;

        // Date range filter
        if (dateRange?.from) {
            result = result.filter((b) => {
                const batchDate = new Date(b.created_at);
                const startOfDay = new Date(dateRange.from);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
                endOfDay.setHours(23, 59, 59, 999);
                return batchDate >= startOfDay && batchDate <= endOfDay;
            });
        }

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
    }, [batches, searchTerm, statusFilter, dateRange]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, dateRange]);

    const totalPages = Math.max(1, Math.ceil(filteredBatches.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedBatches = filteredBatches.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const openConvertDialog = (batch) => {
        setSelectedBatch(batch);
        setConvertDialogOpen(true);
    };

    const openEditDialog = (batch) => {
        setBatchToEdit(batch);
        setEditDialogOpen(true);
    };

    const openDamagedDialog = (batch) => {
        setBatchToDamage(batch);
        setDamagedDialogOpen(true);
    };

    const openDeleteDialog = (batch) => {
        setBatchToDelete(batch);
        setDeleteDialogOpen(true);
    };

    const refreshBatches = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getBatches();
            setBatches(data ?? []);
        } catch (error) {
            console.error('Failed to refresh batches:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-zinc-100 text-xl font-semibold tracking-tight">Production Command Center</h1>
                    <p className="text-zinc-400 mt-0.5 text-sm">Real-time operations visibility & batch management</p>
                </div>
                <CreateBatchDialog suppliers={suppliers} onSuccess={refreshBatches} />
            </div>

            <EditBatchDialog
                open={editDialogOpen}
                onOpenChange={(open) => {
                    setEditDialogOpen(open);
                    if (!open) setBatchToEdit(null);
                }}
                batchToEdit={batchToEdit}
                onSuccess={refreshBatches}
            />

            <DamagedBatchDialog
                open={damagedDialogOpen}
                onOpenChange={(open) => {
                    setDamagedDialogOpen(open);
                    if (!open) setBatchToDamage(null);
                }}
                batchToDamage={batchToDamage}
                onSuccess={refreshBatches}
            />

            <ConvertBatchDialog
                open={convertDialogOpen}
                onOpenChange={(open) => {
                    setConvertDialogOpen(open);
                    if (!open) setSelectedBatch(null);
                }}
                selectedBatch={selectedBatch}
                products={products}
                onSuccess={refreshBatches}
            />

            <DeleteBatchDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) setBatchToDelete(null);
                }}
                batchToDelete={batchToDelete}
                onSuccess={refreshBatches}
            />

            <ProductionKPIs
                batches={filteredBatches}
                date={dateRange}
                onDateChange={setDateRange}
                isLoading={isLoading}
            />

            {/* Filters & Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                    {/* Status Filter Buttons */}
                    <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
                        {[
                            { value: 'all', label: 'All' },
                            { value: 'pending', label: 'Processing' },
                            { value: 'damaged', label: 'Damaged' },
                            { value: 'finished', label: 'Finished' },
                        ].map((status) => (
                            <button
                                key={status.value}
                                onClick={() => setStatusFilter(status.value)}
                                className={cn(
                                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                                    statusFilter === status.value
                                        ? 'bg-zinc-700 text-zinc-100'
                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50',
                                )}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Export */}
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                    onClick={() => exportBatchesToCsv(filteredBatches)}
                >
                    <Download className="size-4" />
                    Export CSV
                </Button>
            </div>

            {/* Data Table */}
            <div className="overflow-hidden rounded border border-zinc-800">
                <div className="border-b border-zinc-800 bg-zinc-900/80 px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-zinc-200 text-sm font-medium">Production Batches</h2>
                        <div className="hidden sm:flex items-center gap-3 text-[11px]">
                            <span className="flex items-center gap-1.5">
                                <span className="size-2 rounded-full bg-emerald-500" />
                                <span className="text-zinc-500">≥40%</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="size-2 rounded-full bg-amber-500" />
                                <span className="text-zinc-500">30-39%</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="size-2 rounded-full bg-red-500" />
                                <span className="text-zinc-500">&lt;30%</span>
                            </span>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                            <Input
                                placeholder="Search batches…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-7 w-[160px] border-zinc-700 bg-zinc-950 pl-8 text-[10px] text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="border-zinc-700/80 hover:!bg-transparent">
                            <TableHead className="text-zinc-500 h-8 px-2 text-xs">
                                Batch ID
                            </TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-xs hidden md:table-cell">
                                Supplier
                            </TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-xs">Raw Weight</TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-xs hidden sm:table-cell">
                                Cost / lb
                            </TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-xs">Yield %</TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-xs">Bags</TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-xs">Status</TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-xs hidden lg:table-cell">
                                Timeline
                            </TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-xs hidden xl:table-cell">
                                Total Cost
                            </TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-xs w-12">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: PAGE_SIZE }).map((_, i) => (
                                <TableRow key={i} className="border-zinc-700/80">
                                    <TableCell className="px-2 py-2.5">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="mt-1 h-3 w-24" />
                                    </TableCell>
                                    <TableCell className="px-2 py-2.5 hidden md:table-cell">
                                        <Skeleton className="h-4 w-28" />
                                    </TableCell>
                                    <TableCell className="px-2 py-2.5">
                                        <Skeleton className="h-4 w-14" />
                                    </TableCell>
                                    <TableCell className="px-2 py-2.5 hidden sm:table-cell">
                                        <Skeleton className="h-4 w-12" />
                                    </TableCell>
                                    <TableCell className="px-2 py-2.5">
                                        <Skeleton className="h-5 w-12 rounded-full" />
                                    </TableCell>
                                    <TableCell className="px-2 py-2.5">
                                        <Skeleton className="h-4 w-8" />
                                    </TableCell>
                                    <TableCell className="px-2 py-2.5">
                                        <Skeleton className="h-4 w-16" />
                                    </TableCell>
                                    <TableCell className="px-2 py-2.5 hidden lg:table-cell">
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                    <TableCell className="px-2 py-2.5 hidden xl:table-cell">
                                        <Skeleton className="h-4 w-16" />
                                    </TableCell>
                                    <TableCell className="px-2 py-2.5 w-12">
                                        <Skeleton className="h-7 w-7 rounded" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : paginatedBatches.length === 0 ? (
                            <TableRow className="border-zinc-700/80">
                                <TableCell colSpan={10} className="text-zinc-400 py-8 text-center text-xs">
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
                                        className="group border-zinc-700/80 transition-colors hover:!bg-zinc-700/50"
                                    >
                                        <TableCell className="text-zinc-200 px-2 py-2.5 text-xs font-medium group-hover:text-zinc-100">
                                            <div className="flex flex-col">
                                                <span className="font-mono">{batch.batch_number}</span>
                                                <span className="text-[10px] text-zinc-500 md:hidden group-hover:text-zinc-400">
                                                    {batch.suppliers?.name || 'Unknown Supplier'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-zinc-400 px-2 py-2.5 text-xs hidden md:table-cell group-hover:text-zinc-300">
                                            {batch.suppliers?.name || 'Unknown Supplier'}
                                        </TableCell>
                                        <TableCell className="text-zinc-100 px-2 py-2.5 tabular-nums text-xs font-medium group-hover:text-white">
                                            {batch.raw_weight.toFixed(1)} lbs
                                        </TableCell>
                                        <TableCell className="text-zinc-400 px-2 py-2.5 tabular-nums text-xs hidden sm:table-cell group-hover:text-zinc-300">
                                            {formatCurrency(batch.cost_per_pound)}
                                        </TableCell>
                                        <TableCell className="px-2 py-2.5">
                                            <span
                                                className={cn(
                                                    'inline-flex items-center rounded-full border px-1.5 py-0.5 text-[11px] font-medium tabular-nums',
                                                    yieldConfig.className,
                                                )}
                                            >
                                                {yieldConfig.label}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-zinc-300 px-2 py-2.5 tabular-nums text-xs">
                                            {batch.finished_bags?.reduce(
                                                (sum, fb) => sum + (fb.stock_quantity || 0),
                                                0,
                                            ) || '—'}
                                        </TableCell>
                                        <TableCell className="px-2 py-2.5 text-xs">
                                            <span className={statusConfig.className}>{statusConfig.label}</span>
                                        </TableCell>
                                        <TableCell className="text-zinc-400 px-2 py-2.5 text-xs hidden lg:table-cell group-hover:text-zinc-300">
                                            {batch.created_at ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span>
                                                        {new Date(batch.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                    {batch.tracking_status === 'finished' && batch.last_updated ? (
                                                        <>
                                                            <span className="text-zinc-600">→</span>
                                                            <span className="text-emerald-400">
                                                                {new Date(batch.last_updated).toLocaleDateString(
                                                                    'en-US',
                                                                    { month: 'short', day: 'numeric' },
                                                                )}
                                                            </span>
                                                        </>
                                                    ) : batch.tracking_status === 'processing' ? (
                                                        <>
                                                            <span className="text-zinc-600">→</span>
                                                            <span className="text-amber-400 animate-pulse">...</span>
                                                        </>
                                                    ) : null}
                                                </div>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-zinc-400 px-2 py-2.5 tabular-nums text-xs hidden xl:table-cell group-hover:text-zinc-300">
                                            ${(batch.initial_weight * batch.cost_per_pound).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="px-2 py-2.5">
                                            {batch.tracking_status?.toLowerCase() !== 'damaged' && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-600/50"
                                                        >
                                                            <MoreHorizontal className="size-3.5" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-48 border-zinc-800 bg-zinc-900"
                                                    >
                                                        {batch.tracking_status &&
                                                            batch.tracking_status?.toLowerCase() !== 'finished' && (
                                                                <DropdownMenuItem
                                                                    className={cn(
                                                                        'cursor-pointer',
                                                                        batch.tracking_status?.toLowerCase() ===
                                                                            'smoking' ||
                                                                            batch.tracking_status?.toLowerCase() ===
                                                                                'drying'
                                                                            ? 'bg-amber-500/10 text-amber-400 font-medium focus:bg-amber-500/20 focus:text-amber-300'
                                                                            : 'text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100',
                                                                    )}
                                                                    onClick={() => openConvertDialog(batch)}
                                                                >
                                                                    Convert to Finished Goods
                                                                </DropdownMenuItem>
                                                            )}
                                                        {isProcessingStatus(batch.tracking_status) && (
                                                            <DropdownMenuItem
                                                                className="text-zinc-200 cursor-pointer focus:bg-zinc-800 focus:text-zinc-100"
                                                                onClick={() => openEditDialog(batch)}
                                                            >
                                                                Edit Batch Details
                                                            </DropdownMenuItem>
                                                        )}
                                                        {isProcessingStatus(batch.tracking_status) && (
                                                            <DropdownMenuItem
                                                                className="text-amber-400 cursor-pointer focus:bg-amber-500/10 focus:text-amber-300"
                                                                onClick={() => openDamagedDialog(batch)}
                                                            >
                                                                Mark as Damaged
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator className="bg-zinc-800" />
                                                        <DropdownMenuItem
                                                            className="text-red-400 cursor-pointer focus:bg-red-500/10 focus:text-red-400"
                                                            onClick={() => openDeleteDialog(batch)}
                                                        >
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

                {/* Pagination */}
                {filteredBatches.length > 0 && (
                    <div className="flex w-full items-center justify-between gap-4 border-t border-zinc-800/80 px-4 py-3">
                        <p className="text-zinc-500 text-xs">
                            Showing {(safePage - 1) * PAGE_SIZE + 1}–
                            {Math.min(safePage * PAGE_SIZE, filteredBatches.length)} of {filteredBatches.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80 text-xs"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={safePage <= 1}
                            >
                                <ChevronLeft className="size-3.5" />
                                Prev
                            </Button>
                            <span className="px-2 text-xs text-zinc-500">
                                Page {safePage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80 text-xs"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={safePage >= totalPages}
                            >
                                Next
                                <ChevronRight className="size-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
