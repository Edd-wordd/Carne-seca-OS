'use client';

import { cn } from '@/lib/utils/helpers';

export function OrderKpiCard({ label, value, sublabel, icon: Icon, accent }) {
    const accentCls =
        accent === 'emerald'
            ? 'text-emerald-400/80'
            : accent === 'amber'
              ? 'text-amber-400/80'
              : accent === 'red'
                ? 'text-red-400/80'
                : 'text-zinc-500';
    const valueCls =
        accent === 'emerald'
            ? 'text-emerald-400'
            : accent === 'amber'
              ? 'text-amber-400'
              : accent === 'red'
                ? 'text-red-400'
                : 'text-zinc-100';
    return (
        <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
            <Icon className={cn('size-4 shrink-0', accentCls)} />
            <div className="min-w-0">
                <p className="truncate text-zinc-400 text-[10px]">{label}</p>
                <p className={cn('text-sm font-semibold tabular-nums', valueCls)}>{value}</p>
                <p className="mt-0.5 truncate text-zinc-500 text-[9px]">{sublabel}</p>
            </div>
        </div>
    );
}
