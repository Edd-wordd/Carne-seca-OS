'use client';

import * as React from 'react';
import { CircleDollarSign } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';

export default function SuppliesKPIs({ date, onDateChange, totalValue, byCategory, categories }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Overview</p>
                    <p className="text-[9px] text-zinc-600">Supplies KPIs</p>
                </div>
                <DateRangePicker date={date} onDateChange={onDateChange} />
            </div>
            <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <CircleDollarSign className="size-4 shrink-0 text-indigo-400/80" />
                    <div className="min-w-0">
                        <p className="truncate text-zinc-400 text-[10px]">Total</p>
                        <p className="text-zinc-100 text-sm font-semibold tabular-nums">
                            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
                {categories.map((c) => {
                    const Icon = c.icon;
                    return (
                        <div
                            key={c.value}
                            className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5"
                        >
                            <Icon className="size-4 shrink-0 text-zinc-500" />
                            <div className="min-w-0">
                                <p className="truncate text-zinc-400 text-[10px]">{c.label}</p>
                                <p className="text-zinc-200 text-sm font-medium tabular-nums">
                                    $
                                    {(byCategory[c.value] ?? 0).toLocaleString(undefined, {
                                        minimumFractionDigits: 0,
                                    })}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
