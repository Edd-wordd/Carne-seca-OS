'use client';

import * as React from 'react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Scale, TrendingUp, DollarSign } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

export default function ProductionKPIs({ batches = [], date, onDateChange }) {
    const mtdThroughput = batches.reduce((sum, b) => sum + (b.raw_weight ?? 0), 0);
    const avgYield = React.useMemo(() => {
        const finished = batches.filter((b) => b.yield_percent != null);
        if (finished.length === 0) return '0';
        return (
            (finished.reduce((sum, b) => sum + (b.yield_percent ?? 0), 0) / finished.length) *
            100
        ).toFixed(1);
    }, [batches]);
    const mtdCost = batches.reduce((sum, b) => sum + (b.total_cost ?? 0), 0);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Overview</span>
                <DateRangePicker date={date} onDateChange={onDateChange} />
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-lg border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <Scale className="size-4 text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Throughput</p>
                        <p className="text-sm font-semibold text-zinc-100 tabular-nums">
                            {mtdThroughput.toLocaleString()} lbs
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <TrendingUp className="size-4 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Avg Yield</p>
                        <p className="text-sm font-semibold text-zinc-100 tabular-nums">
                            {avgYield}%
                            <span
                                className={cn(
                                    'text-[10px] font-normal ml-1.5',
                                    parseFloat(avgYield) >= 35
                                        ? 'text-emerald-400'
                                        : parseFloat(avgYield) >= 30
                                          ? 'text-amber-400'
                                          : 'text-red-400',
                                )}
                            >
                                {parseFloat(avgYield) >= 35
                                    ? 'on target'
                                    : `${(35 - parseFloat(avgYield)).toFixed(1)}% below target`}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <DollarSign className="size-4 text-violet-400 shrink-0" />
                    <div className="min-w-0">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Total Cost</p>
                        <p className="text-sm font-semibold text-zinc-100 tabular-nums">
                            {formatCurrency(mtdCost)}
                            <span className="text-zinc-500 text-[10px] font-normal ml-1.5">
                                {mtdThroughput > 0 ? `$${(mtdCost / mtdThroughput).toFixed(2)}/lb` : '—'}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
