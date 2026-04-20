'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Download, Minus, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { cn } from '@/lib/utils/helpers';
import { CATEGORY_STYLES } from '@/app/admin/finance/expenses/_components/ExpensesTable';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const MOCK_PNL = {
    label: 'Mock totals',
    revenueCents: 7240000,
    expensesCents: 2810000,
    payoutsCents: 820000,
    /** Prior period (mock) — same window length, previous period */
    prior: {
        revenueCents: 6500000,
        expensesCents: 2650000,
        payoutsCents: 900000,
    },
};

/** Mock split — sums to `MOCK_PNL.expensesCents` */
const MOCK_EXPENSE_BY_CATEGORY = [
    { category: 'Raw Materials', cents: 980000 },
    { category: 'Packaging', cents: 520000 },
    { category: 'Logistics', cents: 450000 },
    { category: 'Seasoning', cents: 310000 },
    { category: 'Software', cents: 280000 },
    { category: 'Other', cents: 270000 },
];

const EXPENSE_BAR_FILL = {
    'Raw Materials': 'bg-amber-500/55',
    Packaging: 'bg-indigo-500/55',
    Seasoning: 'bg-emerald-500/55',
    Logistics: 'bg-cyan-500/55',
    Software: 'bg-fuchsia-500/55',
    Other: 'bg-zinc-500/55',
};

/** Mock splits — each sums to `MOCK_PNL.revenueCents`. `markets` = in-person (e.g. farmers markets), not a POS terminal. */
const MOCK_REVENUE_BY_CHANNEL = [
    { key: 'website', label: 'Website', cents: 5210000 },
    { key: 'markets', label: 'Markets', cents: 2030000 },
];

const MOCK_REVENUE_BY_PRODUCT = [
    { key: 'original', label: 'Original', cents: 2890000 },
    { key: 'spicy', label: 'Spicy', cents: 1980000 },
    { key: 'bundles', label: 'Gift bundles', cents: 1120000 },
    { key: 'wholesale', label: 'Bulk / wholesale', cents: 950000 },
    { key: 'other', label: 'Other products', cents: 300000 },
];

/** Hex fills for revenue charts (donut + bars) */
const CHANNEL_CHART_FILL = {
    website: '#10b981',
    markets: '#8b5cf6',
};

const PRODUCT_CHART_FILL = {
    original: '#10b981',
    spicy: '#f97316',
    bundles: '#f43f5e',
    wholesale: '#38bdf8',
    other: '#71717a',
};

/** Mock month-over-month (cents). Last row matches `MOCK_PNL` for continuity. */
const MOCK_MOM_TREND = (() => {
    const labels = [
        `May '25`,
        `Jun '25`,
        `Jul '25`,
        `Aug '25`,
        `Sep '25`,
        `Oct '25`,
        `Nov '25`,
        `Dec '25`,
        `Jan '26`,
        `Feb '26`,
        `Mar '26`,
        `Apr '26`,
    ];
    const triples = [
        [520, 242, 81],
        [551, 251, 79],
        [498, 238, 82],
        [612, 265, 85],
        [580, 255, 80],
        [635, 272, 88],
        [601, 260, 83],
        [668, 285, 91],
        [590, 258, 84],
        [702, 278, 86],
        [685, 270, 85],
        [724, 281, 82],
    ];
    return triples.map(([r, e, p], i) => {
        const revenue = r * 10000;
        const expenses = e * 10000;
        const payouts = p * 10000;
        return { month: labels[i], revenue, expenses, payouts, net: revenue - expenses - payouts };
    });
})();

const MOM_CHART_CONFIG = {
    revenue: { label: 'Revenue', color: '#34d399' },
    expenses: { label: 'Expenses', color: '#fb7185' },
    payouts: { label: 'Payouts', color: '#fbbf24' },
    net: { label: 'Net profit', color: '#d4d4d8' },
};

function formatAxisCentsTick(cents) {
    const k = (Number(cents) || 0) / 100000;
    return `$${k.toFixed(1)}k`;
}

function NetMarginHero({ revenueCents, netCents, priorRevenueCents, priorNetCents, className }) {
    const currentPct = revenueCents > 0 ? (netCents / revenueCents) * 100 : 0;
    const marginPct = currentPct.toFixed(1);
    const priorPct = priorRevenueCents > 0 ? (priorNetCents / priorRevenueCents) * 100 : 0;
    const deltaPp = currentPct - priorPct;
    const positive = deltaPp >= 0;
    const tone = deltaPp === 0 ? 'text-zinc-500' : positive ? 'text-emerald-400' : 'text-red-400';
    const Icon = deltaPp > 0 ? ArrowUpRight : deltaPp < 0 ? ArrowDownRight : Minus;

    return (
        <div
            className={cn(
                'flex h-full min-h-0 flex-col justify-between rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/50 via-zinc-950/40 to-zinc-900/90 px-4 py-4 shadow-sm sm:px-5 sm:py-5 lg:py-4',
                className,
            )}
        >
            <div className="flex min-h-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-500/90">Net margin</p>
                    <p
                        className={cn(
                            'mt-1 text-4xl font-bold tabular-nums tracking-tight sm:text-5xl lg:text-[2.35rem] lg:leading-none xl:text-4xl',
                            netCents >= 0 ? 'text-emerald-300' : 'text-red-400',
                        )}
                    >
                        {marginPct}
                        <span className="text-xl font-semibold text-emerald-500/80 sm:text-2xl lg:text-xl xl:text-2xl">
                            %
                        </span>
                    </p>
                    <p className="mt-2 text-[10px] leading-relaxed text-zinc-500 lg:mt-1.5 lg:text-[10px] lg:leading-snug">
                        Share of revenue after expenses and payouts.
                    </p>
                </div>
                <div className="flex shrink-0 flex-col gap-0.5 border-t border-emerald-500/15 pt-3 lg:border-t-0 lg:border-l lg:pl-4 lg:pt-0">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">vs prior</p>
                    <p className={cn('flex items-center gap-1 text-xs font-semibold tabular-nums sm:text-sm', tone)}>
                        <Icon className="size-3.5 shrink-0 sm:size-4" aria-hidden />
                        <span>
                            {deltaPp >= 0 ? '+' : ''}
                            {deltaPp.toFixed(1)} pp
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

function formatCurrency(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format((Number(cents) || 0) / 100);
}

function BottomLineSummaryCard({ label, revenueCents, expensesCents, payoutsCents, netCents }) {
    return (
        <Card className="flex h-full min-h-0 flex-col border-zinc-800 bg-zinc-900/70">
            <CardHeader className="space-y-0.5 pb-2 pt-4">
                <CardTitle className="text-sm text-zinc-100">Bottom line</CardTitle>
                <CardDescription className="text-[10px] text-zinc-500">{label}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col pb-4 pt-0">
                <div className="flex flex-1 flex-col justify-center rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-3 font-mono text-[11px] leading-snug">
                    <div className="flex justify-between gap-3 text-zinc-300">
                        <span>Revenue</span>
                        <span className="shrink-0 tabular-nums text-emerald-400">{formatCurrency(revenueCents)}</span>
                    </div>
                    <div className="mt-1.5 flex justify-between gap-3 text-zinc-500">
                        <span className="flex min-w-0 items-center gap-1">
                            <Minus className="size-2.5 shrink-0" />
                            Expenses
                        </span>
                        <span className="shrink-0 tabular-nums text-red-400/90">{formatCurrency(expensesCents)}</span>
                    </div>
                    <div className="mt-1.5 flex justify-between gap-3 text-zinc-500">
                        <span className="flex min-w-0 items-center gap-1">
                            <Minus className="size-2.5 shrink-0" />
                            Payouts
                        </span>
                        <span className="shrink-0 tabular-nums text-amber-400/90">{formatCurrency(payoutsCents)}</span>
                    </div>
                    <div className="mt-2.5 border-t border-zinc-800 pt-2.5 flex justify-between gap-3 text-zinc-100">
                        <span className="font-sans text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                            Net profit
                        </span>
                        <span
                            className={cn(
                                'shrink-0 tabular-nums text-base font-bold leading-none',
                                netCents >= 0 ? 'text-emerald-400' : 'text-red-400',
                            )}
                        >
                            {formatCurrency(netCents)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function formatSignedCurrencyCents(cents) {
    const n = (Number(cents) || 0) / 100;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        signDisplay: 'exceptZero',
    }).format(n);
}

/** `higherIsBetter`: e.g. true for revenue; false for expenses (lower spend is better). */
function deltaMeta(deltaCents, priorCents, higherIsBetter) {
    const pct = priorCents !== 0 ? (((Number(deltaCents) || 0) / priorCents) * 100).toFixed(1) : null;
    let tone = 'text-zinc-500';
    if ((Number(deltaCents) || 0) !== 0) {
        const good =
            higherIsBetter === true
                ? deltaCents > 0
                : higherIsBetter === false
                  ? deltaCents < 0
                  : deltaCents > 0;
        tone = good ? 'text-emerald-400/90' : 'text-red-400/90';
    }
    return { pct, tone };
}

function PriorPeriodDelta({ currentCents, priorCents, higherIsBetter }) {
    const delta = (Number(currentCents) || 0) - (Number(priorCents) || 0);
    const { pct, tone } = deltaMeta(delta, priorCents, higherIsBetter);
    const Icon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;

    return (
        <div className="mt-1">
            <p className={cn('flex flex-wrap items-center gap-x-1 gap-y-0 text-[9px] tabular-nums leading-none', tone)}>
                <Icon className="size-2 shrink-0" aria-hidden />
                <span>{formatSignedCurrencyCents(delta)}</span>
                {pct != null ? <span className="text-zinc-600">({pct}%)</span> : null}
                <span className="text-zinc-600">· vs prior</span>
            </p>
        </div>
    );
}

/** `rows`: `{ key, label, cents, badgeClass, barClass }` */
function BreakdownBarList({ totalCents, rows }) {
    const total = Number(totalCents) || 0;
    const sorted = [...rows].sort((a, b) => (Number(b.cents) || 0) - (Number(a.cents) || 0));

    return (
        <div className="space-y-3">
            {sorted.map((row) => {
                const pct = total > 0 ? ((Number(row.cents) || 0) / total) * 100 : 0;
                return (
                    <div key={row.key} className="space-y-1.5">
                        <div className="flex items-start justify-between gap-3 text-[11px]">
                            <span
                                className={cn(
                                    'inline-flex max-w-[min(100%,12rem)] items-center rounded-full border px-2 py-0.5 font-medium capitalize leading-tight',
                                    row.badgeClass,
                                )}
                            >
                                {row.label}
                            </span>
                            <span className="shrink-0 tabular-nums text-zinc-300">
                                {formatCurrency(row.cents)}
                                <span className="ml-1.5 text-zinc-600">({pct.toFixed(1)}%)</span>
                            </span>
                        </div>
                        <div
                            className="h-2 overflow-hidden rounded-full bg-zinc-800/90"
                            role="presentation"
                            aria-hidden
                        >
                            <div
                                className={cn('h-full rounded-full transition-[width]', row.barClass)}
                                style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function RevenueChannelDonutChart({ totalCents, channelRows }) {
    const total = Number(totalCents) || 0;
    const data = channelRows.map((row) => ({
        key: row.key,
        name: row.label,
        value: row.cents,
        fill: CHANNEL_CHART_FILL[row.key] ?? '#71717a',
    }));

    return (
        <ChartContainer
            config={{
                website: { label: 'Website', color: CHANNEL_CHART_FILL.website },
                markets: { label: 'Markets', color: CHANNEL_CHART_FILL.markets },
            }}
            className="mx-auto aspect-auto h-[200px] w-full max-w-[260px] [&_.recharts-surface]:outline-none"
        >
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={4}
                    strokeWidth={0}
                >
                    {data.map((d) => (
                        <Cell key={d.key} fill={d.fill} />
                    ))}
                </Pie>
                <RechartsTooltip
                    content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const p = payload[0];
                        const v = Number(p.value) || 0;
                        const name = String(p.name ?? '');
                        const pct = total > 0 ? (((v || 0) / total) * 100).toFixed(1) : '0';
                        return (
                            <div className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-[10px] shadow-lg">
                                <p className="font-medium text-zinc-200">{name}</p>
                                <p className="tabular-nums text-zinc-300">
                                    {formatCurrency(v)}{' '}
                                    <span className="text-zinc-500">({pct}%)</span>
                                </p>
                            </div>
                        );
                    }}
                />
                <Legend
                    verticalAlign="bottom"
                    height={32}
                    formatter={(value) => <span className="text-[10px] text-zinc-400">{value}</span>}
                />
            </PieChart>
        </ChartContainer>
    );
}

function RevenueProductBarChart({ totalCents, productRows }) {
    const total = Number(totalCents) || 0;
    const data = productRows.map((row) => ({
        key: row.key,
        name: row.label.length > 13 ? `${row.label.slice(0, 11)}…` : row.label,
        fullLabel: row.label,
        cents: row.cents,
        fill: PRODUCT_CHART_FILL[row.key] ?? '#71717a',
    }));

    return (
        <ChartContainer
            config={Object.fromEntries(
                productRows.map((row) => [
                    row.key,
                    { label: row.label, color: PRODUCT_CHART_FILL[row.key] ?? '#71717a' },
                ]),
            )}
            className="aspect-auto h-[220px] w-full [&_.recharts-surface]:outline-none"
        >
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 0, bottom: 4 }}
                barCategoryGap="18%"
            >
                <XAxis type="number" hide />
                <YAxis
                    type="category"
                    dataKey="name"
                    width={96}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 9, fill: '#a1a1aa' }}
                />
                <RechartsTooltip
                    cursor={{ fill: 'rgba(63, 63, 70, 0.35)' }}
                    content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const row = payload[0].payload;
                        const c = Number(row.cents) || 0;
                        const pct = total > 0 ? ((c / total) * 100).toFixed(1) : '0';
                        return (
                            <div className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-[10px] shadow-lg">
                                <p className="font-medium text-zinc-200">{row.fullLabel}</p>
                                <p className="tabular-nums text-zinc-300">
                                    {formatCurrency(c)} <span className="text-zinc-500">({pct}%)</span>
                                </p>
                            </div>
                        );
                    }}
                />
                <Bar dataKey="cents" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {data.map((d) => (
                        <Cell key={d.key} fill={d.fill} />
                    ))}
                </Bar>
            </BarChart>
        </ChartContainer>
    );
}

function ExpenseBreakdownByCategory({ totalExpensesCents, rows }) {
    const total = Number(totalExpensesCents) || 0;
    const mapped = rows.map((row) => ({
        key: row.category,
        label: row.category,
        cents: row.cents,
        badgeClass: CATEGORY_STYLES[row.category] ?? 'border-zinc-600 bg-zinc-800/70 text-zinc-300',
        barClass: EXPENSE_BAR_FILL[row.category] ?? 'bg-zinc-500/55',
    }));

    return (
        <Card className="h-full border-zinc-800 bg-zinc-900/70">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-100">Expense breakdown by category</CardTitle>
                <CardDescription className="text-[10px] text-zinc-500 leading-relaxed">
                    See where spend went — a single expense total hides which categories moved. Mock split for the
                    selected period.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <BreakdownBarList totalCents={total} rows={mapped} />
            </CardContent>
        </Card>
    );
}

function RevenueBreakdownByProductAndChannel({ totalRevenueCents, channelRows, productRows }) {
    return (
        <Card className="h-full border-zinc-800 bg-zinc-900/70">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-100">Revenue breakdown by product &amp; channel</CardTitle>
                <CardDescription className="text-[10px] text-zinc-500 leading-relaxed">
                    Total revenue alone does not show which products or channels carried the period. Mock splits for
                    the selected range.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <h3 className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">By channel</h3>
                    <RevenueChannelDonutChart totalCents={totalRevenueCents} channelRows={channelRows} />
                </div>
                <div className="space-y-2 border-t border-zinc-800 pt-4">
                    <h3 className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">By product</h3>
                    <RevenueProductBarChart totalCents={totalRevenueCents} productRows={productRows} />
                </div>
            </CardContent>
        </Card>
    );
}

function PnlMonthOverMonthTrendChart() {
    return (
        <Card className="border-zinc-800 bg-zinc-900/70">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-100">Month-over-month trend</CardTitle>
                <CardDescription className="text-[10px] text-zinc-500 leading-relaxed">
                    Compare revenue, expenses, payouts, and net over time — useful for seasonality and step-changes.
                    Mock series (last month aligns with KPI totals).
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <ChartContainer config={MOM_CHART_CONFIG} className="h-[260px] w-full [&_.recharts-surface]:outline-none">
                    <LineChart data={MOCK_MOM_TREND} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-700/60" vertical={false} />
                        <XAxis
                            dataKey="month"
                            tick={{ fill: '#a1a1aa', fontSize: 9 }}
                            tickLine={false}
                            axisLine={false}
                            interval={0}
                            minTickGap={8}
                        />
                        <YAxis
                            tick={{ fill: '#a1a1aa', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatAxisCentsTick}
                            width={44}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="border-zinc-700 bg-zinc-900 text-zinc-100"
                                    formatter={(value) => [formatCurrency(Number(value)), null]}
                                />
                            }
                        />
                        <Legend
                            wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
                            formatter={(value) => (
                                <span className="text-zinc-400">{MOM_CHART_CONFIG[value]?.label ?? value}</span>
                            )}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            name="revenue"
                            stroke={MOM_CHART_CONFIG.revenue.color}
                            strokeWidth={2}
                            dot={{ r: 2, strokeWidth: 0 }}
                            activeDot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="expenses"
                            name="expenses"
                            stroke={MOM_CHART_CONFIG.expenses.color}
                            strokeWidth={2}
                            dot={{ r: 2, strokeWidth: 0 }}
                            activeDot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="payouts"
                            name="payouts"
                            stroke={MOM_CHART_CONFIG.payouts.color}
                            strokeWidth={2}
                            dot={{ r: 2, strokeWidth: 0 }}
                            activeDot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="net"
                            name="net"
                            stroke={MOM_CHART_CONFIG.net.color}
                            strokeWidth={2}
                            strokeDasharray="5 4"
                            dot={{ r: 2, strokeWidth: 0 }}
                            activeDot={{ r: 4 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export default function PnLPage() {
    const [dateRange, setDateRange] = React.useState({ from: undefined, to: undefined });
    const data = MOCK_PNL;
    const netCents = data.revenueCents - data.expensesCents - data.payoutsCents;
    const priorNetCents =
        data.prior.revenueCents - data.prior.expensesCents - data.prior.payoutsCents;

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                    <h1 className="text-zinc-100 text-xl font-semibold tracking-tight">P&amp;L Summary</h1>
                    <p className="text-zinc-500 mt-1 text-sm">
                        Revenue minus expenses minus promoter payouts — what you actually made. Mock UI only.
                    </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2 border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                    >
                        <Download className="size-4" />
                        Export CSV
                    </Button>
                    <DateRangePicker date={dateRange} onDateChange={setDateRange} className="shrink-0" />
                </div>
            </div>

            <div className="space-y-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Overview</span>
                <div className="grid gap-3 lg:grid-cols-2 lg:items-stretch">
                    <div className="min-w-0">
                        <NetMarginHero
                            revenueCents={data.revenueCents}
                            netCents={netCents}
                            priorRevenueCents={data.prior.revenueCents}
                            priorNetCents={priorNetCents}
                        />
                    </div>
                    <div className="min-w-0">
                        <BottomLineSummaryCard
                            label={data.label}
                            revenueCents={data.revenueCents}
                            expensesCents={data.expensesCents}
                            payoutsCents={data.payoutsCents}
                            netCents={netCents}
                        />
                    </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <Card className="border-zinc-800 bg-zinc-900/70">
                        <CardContent className="flex items-start justify-between gap-1.5 px-2.5 py-2">
                            <div className="min-w-0">
                                <p className="text-[9px] uppercase tracking-wider leading-none text-zinc-500">Revenue</p>
                                <p className="mt-px text-sm font-semibold leading-tight tabular-nums text-emerald-400">
                                    {formatCurrency(data.revenueCents)}
                                </p>
                                <PriorPeriodDelta
                                    currentCents={data.revenueCents}
                                    priorCents={data.prior.revenueCents}
                                    higherIsBetter
                                />
                            </div>
                            <ArrowUpRight className="size-3 shrink-0 text-emerald-400" />
                        </CardContent>
                    </Card>
                    <Card className="border-zinc-800 bg-zinc-900/70">
                        <CardContent className="flex items-start justify-between gap-1.5 px-2.5 py-2">
                            <div className="min-w-0">
                                <p className="text-[9px] uppercase tracking-wider leading-none text-zinc-500">Expenses</p>
                                <p className="mt-px text-sm font-semibold leading-tight tabular-nums text-red-400/90">
                                    {formatCurrency(data.expensesCents)}
                                </p>
                                <PriorPeriodDelta
                                    currentCents={data.expensesCents}
                                    priorCents={data.prior.expensesCents}
                                    higherIsBetter={false}
                                />
                            </div>
                            <ArrowDownRight className="size-3 shrink-0 text-red-400/80" />
                        </CardContent>
                    </Card>
                    <Card className="border-zinc-800 bg-zinc-900/70">
                        <CardContent className="flex items-start justify-between gap-1.5 px-2.5 py-2">
                            <div className="min-w-0">
                                <p className="text-[9px] uppercase tracking-wider leading-none text-zinc-500">Payouts</p>
                                <p className="mt-px text-sm font-semibold leading-tight tabular-nums text-amber-400/90">
                                    {formatCurrency(data.payoutsCents)}
                                </p>
                                <PriorPeriodDelta
                                    currentCents={data.payoutsCents}
                                    priorCents={data.prior.payoutsCents}
                                    higherIsBetter={false}
                                />
                            </div>
                            <ArrowDownRight className="size-3 shrink-0 text-amber-400/80" />
                        </CardContent>
                    </Card>
                    <Card className="border-zinc-800 bg-zinc-900/70">
                        <CardContent className="flex items-start justify-between gap-1.5 px-2.5 py-2">
                            <div className="min-w-0">
                                <p className="text-[9px] uppercase tracking-wider leading-none text-zinc-500">Net profit</p>
                                <p
                                    className={cn(
                                        'mt-px text-sm font-semibold leading-tight tabular-nums',
                                        netCents >= 0 ? 'text-emerald-400' : 'text-red-400',
                                    )}
                                >
                                    {formatCurrency(netCents)}
                                </p>
                                <PriorPeriodDelta
                                    currentCents={netCents}
                                    priorCents={priorNetCents}
                                    higherIsBetter
                                />
                            </div>
                            <TrendingUp className="size-3 shrink-0 text-zinc-400" />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <PnlMonthOverMonthTrendChart />

            <div className="grid gap-3 lg:grid-cols-2 lg:items-stretch">
                <div className="min-w-0">
                    <RevenueBreakdownByProductAndChannel
                        totalRevenueCents={data.revenueCents}
                        channelRows={MOCK_REVENUE_BY_CHANNEL}
                        productRows={MOCK_REVENUE_BY_PRODUCT}
                    />
                </div>
                <div className="min-w-0">
                    <ExpenseBreakdownByCategory
                        totalExpensesCents={data.expensesCents}
                        rows={MOCK_EXPENSE_BY_CATEGORY}
                    />
                </div>
            </div>
        </div>
    );
}
