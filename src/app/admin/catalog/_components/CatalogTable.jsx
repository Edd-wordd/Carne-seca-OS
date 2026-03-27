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
import {
    Search,
    MoreHorizontal,
    Eye,
    EyeOff,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    Pencil,
    Trash2,
} from 'lucide-react';
import { cn, formatPrice, formatCurrency, formatDate } from '@/lib/utils/helpers';

export default function CatalogTable({
    filtered,
    paginatedCatalog,
    search,
    setSearch,
    openEdit,
    requestDeleteProduct,
    safeCatalogPage,
    catalogTotalPages,
    setCatalogPage,
    catalogPageSize,
}) {
    return (
        <div className="overflow-hidden rounded border border-zinc-700/80">
            <div className="border-b border-zinc-700/80 bg-zinc-900/80 px-3 py-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-zinc-100 text-xs font-medium">Catalog Items</h2>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                        <Input
                            placeholder="Search catalog…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-7 w-[160px] border-zinc-700 bg-zinc-950 pl-8 text-[10px] text-zinc-100 placeholder:text-zinc-500"
                        />
                    </div>
                </div>
            </div>
            <Table className="table-fixed">
                <TableHeader>
                    <TableRow className="border-zinc-700/80 hover:!bg-transparent">
                        <TableHead className="text-zinc-400 h-8 w-[5%] min-w-14 px-3 text-[10px]">Image</TableHead>
                        <TableHead className="text-zinc-400 h-8 w-[20%] px-3 text-[10px]">Name</TableHead>
                        <TableHead className="text-zinc-400 h-8 w-[15%] px-3 text-[10px] font-mono">SKU</TableHead>
                        <TableHead className="text-zinc-400 h-8 w-[12%] px-3 text-[10px] text-right">
                            Cost/Bag
                        </TableHead>
                        <TableHead className="text-zinc-400 h-8 w-[14%] pr-6 pl-3 text-[10px] text-right">
                            Sell Price
                        </TableHead>
                        <TableHead className="text-zinc-400 h-8 w-[16%] pl-6 pr-3 text-[10px]">Launch date</TableHead>
                        <TableHead className="text-zinc-400 h-8 w-[13%] px-3 text-[10px]">Status</TableHead>
                        <TableHead className="text-zinc-400 h-8 w-[5%] min-w-16 px-3 text-[10px] text-right">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filtered.length === 0 ? (
                        <TableRow className="border-zinc-700/80">
                            <TableCell colSpan={8} className="text-zinc-400 py-8 text-center text-[11px]">
                                No catalog items match the filters
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedCatalog.map((p) => (
                            <TableRow key={p.id} className="group border-zinc-700/80 transition-colors hover:!bg-zinc-700/50">
                                <TableCell className="px-3 py-1.5">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-zinc-700 bg-zinc-900/80">
                                        {p.image_url || p.image ? (
                                            <img src={p.image_url || p.image} alt={p.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <ImageIcon className="size-4 text-zinc-600" />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="px-3 py-1.5">
                                    <p className="text-zinc-200 text-[11px] font-medium group-hover:text-zinc-100">{p.name}</p>
                                </TableCell>
                                <TableCell className="px-3 py-1.5 font-mono text-zinc-400 text-[11px] group-hover:text-zinc-300">
                                    {p.sku || '—'}
                                </TableCell>
                                <TableCell className="text-zinc-400 px-3 py-1.5 text-right tabular-nums text-[11px] group-hover:text-zinc-300">
                                    {p.cost_per_bag != null ? formatCurrency(p.cost_per_bag) : '—'}
                                </TableCell>
                                <TableCell className="text-emerald-400 px-3 py-1.5 text-right tabular-nums text-[11px] group-hover:text-emerald-300">
                                    {formatPrice(p.price_cents)}
                                </TableCell>
                                <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] group-hover:text-zinc-300">
                                    {formatDate(p.launch_date ?? p.launchDate)}
                                </TableCell>
                                <TableCell className="px-3 py-1.5">
                                    <span
                                        className={cn(
                                            'inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium',
                                            p.status === 'active'
                                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                                : 'border-zinc-600/50 bg-zinc-800/50 text-zinc-500',
                                        )}
                                    >
                                        {p.status === 'active' ? (
                                            <>
                                                <Eye className="size-3" />
                                                Active
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff className="size-3" />
                                                Hidden
                                            </>
                                        )}
                                    </span>
                                </TableCell>
                                <TableCell className="px-3 py-1.5 text-right">
                                    <div className="flex justify-end">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-zinc-400 hover:bg-zinc-600/50 hover:text-zinc-100"
                                                    aria-label="Open actions"
                                                >
                                                    <MoreHorizontal className="size-4" />
                                                    <span className="sr-only">Actions</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900">
                                                <DropdownMenuItem
                                                    onClick={() => openEdit(p)}
                                                    className="cursor-pointer text-zinc-200"
                                                >
                                                    <Pencil className="mr-2 size-3.5" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => requestDeleteProduct(p)}
                                                    className="cursor-pointer text-red-400 focus:text-red-400"
                                                >
                                                    <Trash2 className="mr-2 size-3.5" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            {filtered.length > 0 && (
                <div className="flex w-full items-center justify-between gap-4 border-t border-zinc-700/80 px-4 py-3">
                    <p className="text-zinc-500 text-xs">
                        Showing {(safeCatalogPage - 1) * catalogPageSize + 1}–
                        {Math.min(safeCatalogPage * catalogPageSize, filtered.length)} of {filtered.length}
                    </p>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80 text-xs"
                            onClick={() => setCatalogPage((p) => Math.max(1, p - 1))}
                            disabled={safeCatalogPage <= 1}
                        >
                            <ChevronLeft className="size-3.5" />
                            Prev
                        </Button>
                        <span className="px-2 text-xs text-zinc-500">
                            Page {safeCatalogPage} of {catalogTotalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80 text-xs"
                            onClick={() => setCatalogPage((p) => Math.min(catalogTotalPages, p + 1))}
                            disabled={safeCatalogPage >= catalogTotalPages}
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
