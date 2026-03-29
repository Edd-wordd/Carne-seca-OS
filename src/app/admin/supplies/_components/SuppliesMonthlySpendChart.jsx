'use client';

import * as React from 'react';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';

const spendChartConfig = {
    total: { label: 'Spend', color: 'var(--chart-1)' },
};

export default function SuppliesMonthlySpendChart({ purchaseHistory = [] }) {
    const gradientId = React.useId().replace(/:/g, '');

    const monthlySpendChartData = React.useMemo(() => {
        const byMonth = {};
        purchaseHistory.forEach((h) => {
            if (h?.date == null || String(h.date).trim() === '') return;
            const m = String(h.date).slice(0, 7);
            byMonth[m] = (byMonth[m] || 0) + h.cost;
        });
        return Object.entries(byMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, total]) => {
                const [y, mo] = month.split('-');
                const monthLabel = new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                });
                return { month: monthLabel, total: Math.round(total * 100) / 100, monthKey: month };
            });
    }, [purchaseHistory]);

    const now = new Date();
    const dayOfMonth = now.getDate();
    const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthProgressPct = Math.round((dayOfMonth / daysInCurrentMonth) * 100);
    const currentMonthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const fillId = `spendAreaFill-${gradientId}`;

    return (
        <div className="overflow-hidden rounded border border-zinc-700/80 bg-zinc-900/60">
            <div className="border-b border-zinc-700/80 bg-zinc-900/80 px-3 py-1.5">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-zinc-100 text-xs font-medium">Monthly Spend</h2>
                        <p className="text-zinc-400 text-[9px]">Compare month-by-month supply spend</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right min-w-0">
                                <p className="text-zinc-400 text-[9px]">Through {currentMonthName}</p>
                                <p className="text-zinc-200 text-[11px] font-medium tabular-nums">
                                    Day {dayOfMonth} of {daysInCurrentMonth} · {monthProgressPct}%
                                </p>
                            </div>
                            <div className="w-20 flex-shrink-0">
                                <Progress
                                    value={monthProgressPct}
                                    className="h-1.5 bg-zinc-700 [&_[data-slot=progress-indicator]]:bg-indigo-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-3">
                {monthlySpendChartData.length === 0 ? (
                    <p className="text-zinc-400 py-8 text-center text-[11px]">
                        No purchase history yet — add supplies to see the chart
                    </p>
                ) : (
                    <ChartContainer config={spendChartConfig} className="h-[200px] w-full">
                        <AreaChart data={monthlySpendChartData} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                            <defs>
                                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-700/60" vertical={false} />
                            <XAxis
                                dataKey="month"
                                tick={{ fill: '#a1a1aa', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{ fill: '#a1a1aa', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) => `$${v}`}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        formatter={(v) => [
                                            `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                                        ]}
                                    />
                                }
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="var(--chart-1)"
                                strokeWidth={2}
                                fill={`url(#${fillId})`}
                            />
                        </AreaChart>
                    </ChartContainer>
                )}
            </div>
        </div>
    );
}
