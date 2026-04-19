'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

export const CATEGORY_STYLES = {
    'Raw Materials': 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    Packaging: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
    Seasoning: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    Logistics: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
    Software: 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400',
    Other: 'border-zinc-600 bg-zinc-800/70 text-zinc-300',
};

export function formatCurrency(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format((Number(cents) || 0) / 100);
}

const PAGE_SIZE = 5;

function ExpensesPaginationBar({ total, currentPage, pageSize, onPageChange }) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, total);

    if (total === 0) return null;

    return (
        <div className="flex w-full items-center justify-between gap-4 border-t border-zinc-800/80 px-4 py-3">
            <p className="text-zinc-500 text-xs">
                Showing {start + 1}–{end} of {total}
            </p>
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80"
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
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80"
                    onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                >
                    Next
                    <ChevronRight className="size-3.5" />
                </Button>
            </div>
        </div>
    );
}

export function ExpensesTable({
    filteredExpenses,
    query,
    onQueryChange,
    currentPage,
    onPageChange,
    onEdit,
    onDelete,
    normalizePaymentMethod,
}) {
    const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedExpenses = filteredExpenses.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    return (
        <div className="mt-4">
            <div className="overflow-hidden rounded border border-zinc-800">
                <div className="border-b border-zinc-800 bg-zinc-900/80 px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-zinc-200 text-sm font-medium">Recent expenses</h2>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                            <Input
                                value={query}
                                onChange={(e) => onQueryChange(e.target.value)}
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
                            <TableHead className="text-zinc-400 h-8 px-2 text-right text-[10px] w-14">
                                Actions
                            </TableHead>
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
                            paginatedExpenses.map((x) => (
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
                                        {x.note?.trim() ? x.note : (
                                            <span className="text-zinc-600">—</span>
                                        )}
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
                                    <TableCell className="px-2 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
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
                                                    onClick={() => onEdit(x)}
                                                >
                                                    <Pencil className="mr-2 size-3.5" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="cursor-pointer text-xs text-red-400 focus:bg-zinc-800 focus:text-red-400"
                                                    onClick={() => onDelete(x)}
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
                <ExpensesPaginationBar
                    total={filteredExpenses.length}
                    currentPage={safePage}
                    pageSize={PAGE_SIZE}
                    onPageChange={onPageChange}
                />
            </div>
        </div>
    );
}
