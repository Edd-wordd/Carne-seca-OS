'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

function formatDiscount(c) {
    const d = c.discount;
    if (!d) return '—';
    if (d.type === 'percent') return `${d.value}% off`;
    if (d.type === 'fixed') {
        const currency = d.currency ?? 'USD';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format((d.value ?? 0) / 100);
    }
    return '—';
}

function formatExpires(iso) {
    if (!iso) return '—';
    return iso.slice(0, 10);
}

function couponNote(c) {
    if (c.metadata?.note) return c.metadata.note;
    const values = Object.values(c.metadata ?? {}).filter((v) => v != null && String(v).trim() !== '');
    return values.length ? values.join(' · ') : '';
}

export function CouponsTable({ coupons, query, onQueryChange, filter, onFilterChange }) {
    return (
        <Card className="border-zinc-800 bg-zinc-900/70">
            <CardHeader className="pb-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-sm text-zinc-100">All coupons</CardTitle>
                        <CardDescription className="text-[10px] text-zinc-500">
                            Code, discount, usage, expiry
                        </CardDescription>
                    </div>
                    <div className="relative w-full sm:w-56">
                        <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                        <Input
                            value={query}
                            onChange={(e) => onQueryChange(e.target.value)}
                            placeholder="Search code…"
                            className="h-8 border-zinc-700 bg-zinc-950 pl-7 text-xs text-zinc-100 placeholder:text-zinc-500"
                        />
                    </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-1">
                    {['all', 'active', 'inactive'].map((f) => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => onFilterChange(f)}
                            className={cn(
                                'rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                                filter === f
                                    ? 'bg-zinc-700 text-zinc-100'
                                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                <Table>
                    <TableHeader>
                        <TableRow className="border-zinc-800 hover:bg-transparent">
                            <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Code</TableHead>
                            <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Discount</TableHead>
                            <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Uses</TableHead>
                            <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Expires</TableHead>
                            <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Status</TableHead>
                            <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Note</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {coupons.length === 0 ? (
                            <TableRow className="border-zinc-800">
                                <TableCell colSpan={6} className="py-8 text-center text-xs text-zinc-500">
                                    No coupons match filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            coupons.map((c, index) => (
                                <TableRow key={c.id ?? `${c.code}-${index}`} className="border-zinc-800/80">
                                    <TableCell className="px-4 py-2">
                                        <span className="font-mono text-[11px] font-medium text-zinc-200">
                                            {c.code}
                                        </span>
                                        {c.id ? <p className="text-[10px] text-zinc-600">{c.id}</p> : null}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-[11px] text-zinc-300">
                                        {formatDiscount(c)}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-[11px] tabular-nums text-zinc-400">
                                        {(c.uses?.redeemed ?? 0).toLocaleString()}
                                        {c.uses?.max != null
                                            ? ` / ${c.uses.max.toLocaleString()}`
                                            : ' / ∞'}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-[11px] text-zinc-400">
                                        {formatExpires(c.expires)}
                                    </TableCell>
                                    <TableCell className="px-3 py-2">
                                        <span
                                            className={cn(
                                                'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium',
                                                c.status === 'active'
                                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                                    : 'border-zinc-600 bg-zinc-800/60 text-zinc-500',
                                            )}
                                        >
                                            {c.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-[220px] px-4 py-2 text-[10px] text-zinc-500">
                                        {couponNote(c)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
