'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { TrendingUp, Receipt, Truck } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { formatCurrency } from './ExpensesTable';

export function ExpensesKpiCards({ dateRange, onDateChange, kpis }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Overview</span>
                <DateRangePicker date={dateRange} onDateChange={onDateChange} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {[
                    { label: 'Total Spend', value: formatCurrency(kpis.total), icon: Receipt, accent: 'text-red-400' },
                    { label: 'Last 7 Days', value: formatCurrency(kpis.thisWeek), icon: TrendingUp, accent: 'text-amber-400' },
                    { label: 'Avg Purchase', value: formatCurrency(kpis.avgTicket), icon: Truck, accent: 'text-zinc-300' },
                ].map((kpi) => (
                    <Card key={kpi.label} className="border-zinc-800 bg-zinc-900/70">
                        <CardContent className="flex items-start justify-between p-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-zinc-500">{kpi.label}</p>
                                <p className={cn('mt-1 text-base font-semibold tabular-nums', kpi.accent)}>{kpi.value}</p>
                            </div>
                            <kpi.icon className={cn('mt-0.5 size-4', kpi.accent)} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
