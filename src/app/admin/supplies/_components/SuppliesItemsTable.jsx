'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Pencil, Trash2, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SuppliesItemsTable({
    categories,
    supplySearch,
    onSupplySearchChange,
    paginatedSupplies,
    filteredCount,
    pageSize,
    currentPage,
    totalPages,
    onPageChange,
    formatDate,
    onEdit,
    onDelete,
}) {
    return (
        <div className="overflow-hidden rounded border border-zinc-700/80">
            <div className="border-b border-zinc-700/80 bg-zinc-900/80 px-3 py-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-zinc-100 text-xs font-medium">Supply Items</h2>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                        <Input
                            placeholder="Search supplies…"
                            value={supplySearch}
                            onChange={(e) => onSupplySearchChange(e.target.value)}
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
                        <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Unit</TableHead>
                        <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Description</TableHead>
                        <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Low Threshold</TableHead>
                        <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Last Purchased</TableHead>
                        <TableHead className="text-zinc-400 h-8 px-2 text-[10px] w-12 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedSupplies.length === 0 ? (
                        <TableRow className="border-zinc-700/80">
                            <TableCell colSpan={8} className="text-zinc-400 py-8 text-center text-[11px]">
                                {supplySearch.trim() ? 'No supplies match your search' : 'No supply items'}
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedSupplies.map((s) => {
                            const cat = categories.find((c) => c.value === s.category)?.label ?? s.category;
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
                                        {s.unit ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-zinc-500 px-3 py-1.5 text-[11px] group-hover:text-zinc-400">
                                        {s.description ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-zinc-500 px-3 py-1.5 text-[11px] group-hover:text-zinc-400">
                                        {s.lowThreshold ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] group-hover:text-zinc-300">
                                        {formatDate(s.lastPurchasedAt)}
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
                                                    onClick={() => onEdit(s)}
                                                    className="text-zinc-200 cursor-pointer"
                                                >
                                                    <Pencil className="size-3.5 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onClick={() => onDelete(s)}
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
            {filteredCount > 0 && (
                <div className="flex items-center justify-between gap-4 border-t border-zinc-800/80 px-4 py-3">
                    <p className="text-zinc-500 text-xs">
                        Showing {(currentPage - 1) * pageSize + 1}–
                        {Math.min(currentPage * pageSize, filteredCount)} of {filteredCount}
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
