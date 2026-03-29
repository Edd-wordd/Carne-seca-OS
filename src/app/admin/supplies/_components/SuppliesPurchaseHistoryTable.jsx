'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SuppliesPurchaseHistoryTable({
    categories,
    paymentMethods,
    monthOptions,
    supplyOptions,
    purchaserOptions,
    filterMonth,
    onFilterMonthChange,
    filterSupply,
    onFilterSupplyChange,
    filterPurchasedBy,
    onFilterPurchasedByChange,
    filterPayment,
    onFilterPaymentChange,
    dateSortOrder,
    onToggleDateSort,
    paginatedHistory,
    sortedFilteredCount,
    pageSize,
    currentPage,
    totalPages,
    onPageChange,
    headerAction,
}) {
    return (
        <div className="overflow-hidden rounded border border-zinc-700/80">
            <div className="border-b border-zinc-700/80 bg-zinc-900/80 px-3 py-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h2 className="text-zinc-100 text-xs font-medium">Purchase History</h2>
                        <p className="text-zinc-400 text-[9px]">When you last bought each supply</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {headerAction}
                        <Select value={filterMonth} onValueChange={onFilterMonthChange}>
                            <SelectTrigger className="h-7 w-[120px] border-zinc-700 bg-zinc-950 text-zinc-100 text-[10px]">
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs">
                                    All months
                                </SelectItem>
                                {monthOptions.map((m) => (
                                    <SelectItem key={m.value} value={m.value} className="text-xs">
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterSupply} onValueChange={onFilterSupplyChange}>
                            <SelectTrigger className="h-7 w-[140px] border-zinc-700 bg-zinc-950 text-zinc-100 text-[10px]">
                                <SelectValue placeholder="Supply" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs">
                                    All supplies
                                </SelectItem>
                                {supplyOptions.map((s) => (
                                    <SelectItem key={s.value} value={s.value} className="text-xs">
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterPurchasedBy} onValueChange={onFilterPurchasedByChange}>
                            <SelectTrigger className="h-7 w-[130px] border-zinc-700 bg-zinc-950 text-zinc-100 text-[10px]">
                                <SelectValue placeholder="Purchased by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs">
                                    All purchasers
                                </SelectItem>
                                {purchaserOptions.map((p) => (
                                    <SelectItem key={p.value} value={p.value} className="text-xs">
                                        {p.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterPayment} onValueChange={onFilterPaymentChange}>
                            <SelectTrigger className="h-7 min-w-[150px] border-zinc-700 bg-zinc-950 text-zinc-100 text-[10px]">
                                <SelectValue placeholder="Payment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs">
                                    All payment methods
                                </SelectItem>
                                {paymentMethods.map((p) => (
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
                            onClick={onToggleDateSort}
                        >
                            <span className="flex w-full items-center justify-between">
                                Date
                                {dateSortOrder === 'asc' ? (
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
                                    {categories.find((c) => c.value === h.category)?.label ?? h.category}
                                </TableCell>
                                <TableCell className="text-zinc-400 px-3 py-1.5 tabular-nums text-[11px] group-hover:text-zinc-300">
                                    {h.quantity}
                                    {h.weight != null ? ` (${h.weight} lb)` : ''}
                                </TableCell>
                                <TableCell className="text-zinc-500 px-3 py-1.5 text-[11px] group-hover:text-zinc-400">
                                    {h.purchasedFrom}
                                </TableCell>
                                <TableCell className="text-zinc-500 px-3 py-1.5 text-[11px] group-hover:text-zinc-400">
                                    {paymentMethods.find((p) => p.value === h.paymentMethod)?.label ??
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
            {sortedFilteredCount > 0 && (
                <div className="flex items-center justify-between gap-4 border-t border-zinc-800/80 px-4 py-3">
                    <p className="text-zinc-500 text-xs">
                        Showing {(currentPage - 1) * pageSize + 1}–
                        {Math.min(currentPage * pageSize, sortedFilteredCount)} of {sortedFilteredCount}
                    </p>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80 text-xs"
                            onClick={() => onPageChange((p) => Math.max(1, p - 1))}
                            disabled={currentPage <= 1}
                        >
                            <ChevronLeft className="size-3.5" />
                            Prev
                        </Button>
                        <span className="px-2 text-xs text-zinc-500">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80 text-xs"
                            onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages}
                        >
                            Next
                            <ChevronRight className="size-3.5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
