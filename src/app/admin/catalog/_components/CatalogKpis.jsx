'use client';

import { Eye, EyeOff, Package, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/helpers';

export default function CatalogKpis({ totalItems, activeCount, avgMargin }) {
    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                <Package className="size-4 shrink-0 text-indigo-400/80" />
                <div className="min-w-0">
                    <p className="text-zinc-400 text-[10px]">Total Items</p>
                    <p className="text-zinc-100 text-sm font-semibold tabular-nums">{totalItems}</p>
                </div>
            </div>
            <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                <Eye className="size-4 shrink-0 text-emerald-400/80" />
                <div className="min-w-0">
                    <p className="text-zinc-400 text-[10px]">Active</p>
                    <p className="text-zinc-100 text-sm font-semibold tabular-nums">{activeCount}</p>
                </div>
            </div>
            <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                <EyeOff className="size-4 shrink-0 text-zinc-500" />
                <div className="min-w-0">
                    <p className="text-zinc-400 text-[10px]">Hidden</p>
                    <p className="text-zinc-100 text-sm font-semibold tabular-nums">{totalItems - activeCount}</p>
                </div>
            </div>
            <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                <Percent className="size-4 shrink-0 text-amber-400/80" />
                <div className="min-w-0">
                    <p className="text-zinc-400 text-[10px]">Avg margin</p>
                    <p className="text-zinc-100 text-sm font-semibold tabular-nums">
                        {avgMargin != null ? `${formatCurrency(avgMargin.dollars)} · ${avgMargin.pct.toFixed(1)}%` : '—'}
                    </p>
                </div>
            </div>
        </div>
    );
}
