'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Minus, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

const MOCK_PERIODS = {
    month: {
        label: 'This month (mock)',
        revenueCents: 7240000,
        expensesCents: 2810000,
        payoutsCents: 820000,
    },
    ytd: {
        label: 'Year to date (mock)',
        revenueCents: 41850000,
        expensesCents: 16240000,
        payoutsCents: 4930000,
    },
};

function formatCurrency(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format((Number(cents) || 0) / 100);
}

export default function PnLPage() {
    const [period, setPeriod] = React.useState('month');
    const data = MOCK_PERIODS[period];
    const netCents = data.revenueCents - data.expensesCents - data.payoutsCents;
    const marginPct =
        data.revenueCents > 0 ? ((netCents / data.revenueCents) * 100).toFixed(1) : '0';

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-zinc-100 text-xl font-semibold tracking-tight">P&amp;L Summary</h1>
                    <p className="text-zinc-500 mt-1 text-sm">
                        Revenue minus expenses minus promoter payouts — what you actually made. Mock UI only.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800"
                >
                    <Download className="size-4" />
                    Export CSV
                </Button>
            </div>

            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1 w-fit">
                {[
                    { value: 'month', label: 'This month' },
                    { value: 'ytd', label: 'Year to date' },
                ].map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPeriod(opt.value)}
                        className={cn(
                            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                            period === opt.value
                                ? 'bg-zinc-700 text-zinc-100'
                                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-zinc-100">Bottom line</CardTitle>
                    <CardDescription className="text-[10px] text-zinc-500">{data.label}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 font-mono text-sm">
                        <div className="flex justify-between gap-4 text-zinc-300">
                            <span>Revenue</span>
                            <span className="tabular-nums text-emerald-400">
                                {formatCurrency(data.revenueCents)}
                            </span>
                        </div>
                        <div className="mt-2 flex justify-between gap-4 text-zinc-500">
                            <span className="flex items-center gap-1.5">
                                <Minus className="size-3" />
                                Expenses
                            </span>
                            <span className="tabular-nums text-red-400/90">
                                {formatCurrency(data.expensesCents)}
                            </span>
                        </div>
                        <div className="mt-2 flex justify-between gap-4 text-zinc-500">
                            <span className="flex items-center gap-1.5">
                                <Minus className="size-3" />
                                Payouts
                            </span>
                            <span className="tabular-nums text-amber-400/90">
                                {formatCurrency(data.payoutsCents)}
                            </span>
                        </div>
                        <div className="mt-3 border-t border-zinc-800 pt-3 flex justify-between gap-4 text-zinc-100">
                            <span className="font-sans text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                Net profit
                            </span>
                            <span
                                className={cn(
                                    'tabular-nums text-lg font-bold',
                                    netCents >= 0 ? 'text-emerald-400' : 'text-red-400',
                                )}
                            >
                                {formatCurrency(netCents)}
                            </span>
                        </div>
                    </div>
                    <p className="text-[10px] text-zinc-500">
                        Net margin on revenue:{' '}
                        <span className="tabular-nums text-zinc-400">{marginPct}%</span>
                    </p>
                </CardContent>
            </Card>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Revenue</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-emerald-400">
                                {formatCurrency(data.revenueCents)}
                            </p>
                        </div>
                        <ArrowUpRight className="mt-0.5 size-4 text-emerald-400" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Expenses</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-red-400/90">
                                {formatCurrency(data.expensesCents)}
                            </p>
                        </div>
                        <ArrowDownRight className="mt-0.5 size-4 text-red-400/80" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Payouts</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-amber-400/90">
                                {formatCurrency(data.payoutsCents)}
                            </p>
                        </div>
                        <ArrowDownRight className="mt-0.5 size-4 text-amber-400/80" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Net profit</p>
                            <p
                                className={cn(
                                    'mt-1 text-base font-semibold tabular-nums',
                                    netCents >= 0 ? 'text-emerald-400' : 'text-red-400',
                                )}
                            >
                                {formatCurrency(netCents)}
                            </p>
                        </div>
                        <TrendingUp className="mt-0.5 size-4 text-zinc-400" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
