"use client";

import * as React from "react";
import { Line, AreaChart, Area, Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DollarSign, Package, Users, ShoppingCart, Zap, Search, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import OrdersMap from "./components/OrdersMap";

const OVERVIEW_METRICS = [
    { label: "Net Profit", value: "$8,420", sublabel: "Revenue − Production", icon: DollarSign, accent: "emerald" },
    { label: "Total Orders", value: "156", sublabel: "This month", icon: ShoppingCart, accent: "emerald" },
    { label: "Inventory Value", value: "$4,291", sublabel: "On-hand + Consignment", icon: Package, accent: "neutral" },
    { label: "Promoter Debt", value: "$1,240", sublabel: "Unpaid commissions", icon: Users, accent: "amber" },
    { label: "Supply Burn", value: "+12%", sublabel: "This mo vs last", icon: Zap, accent: "neutral" },
    { label: "Fulfillment Queue", value: "12", sublabel: "Pending orders", icon: ShoppingCart, accent: "neutral" },
    { label: "Active Visitors", value: "7", sublabel: "PostHog live", icon: Users, accent: "emerald" },
];

const SALES_VS_PRODUCTION = [
    { month: "Oct", sales: 4200, production: 3800 },
    { month: "Nov", sales: 5100, production: 4800 },
    { month: "Dec", sales: 6200, production: 5900 },
    { month: "Jan", sales: 5800, production: 6200 },
    { month: "Feb", sales: 7200, production: 6800 },
];

const chartConfig = {
    sales: { label: "Sales", color: "var(--chart-1)" },
    production: { label: "Production", color: "var(--chart-2)" },
};

const CONVERSION_FUNNEL = [
    { stage: "Visitors", count: 1200, rate: "100%" },
    { stage: "Views", count: 840, rate: "70%" },
    { stage: "Add to Cart", count: 312, rate: "37%" },
    { stage: "Checkout", count: 198, rate: "63%" },
    { stage: "Purchased", count: 156, rate: "79%" },
];

const conversionChartConfig = { count: { label: "Count", color: "hsl(var(--chart-1))" } };

const OVERVIEW_ALERTS = [
    { id: 1, type: "warning", title: "Low stock", msg: "Seasoned Classic 8oz — 8 units left", time: "2h ago" },
    { id: 2, type: "amber", title: "Promoter debt", msg: "$1,240 unpaid — 3 partners pending payout", time: "1d ago" },
    { id: 3, type: "info", title: "Partner check-up", msg: "Downtown Provisions — monthly check due Mar 1", time: "3d ago" },
    { id: 4, type: "warning", title: "Original 6oz out of stock", msg: "Product hidden from shop until restocked", time: "5d ago" },
];

const TOP_SELLING_PRODUCTS = [
    { rank: 1, name: "Premium Brisket 12oz", units: 142, revenue: 2130 },
    { rank: 2, name: "Limited Smoked", units: 98, revenue: 1470 },
    { rank: 3, name: "Seasoned Classic 8oz", units: 67, revenue: 616 },
    { rank: 4, name: "Original 6oz", units: 43, revenue: 335 },
    { rank: 5, name: "Garlic & Herb 6oz", units: 28, revenue: 238 },
];

export default function AdminOverviewPage() {
    const [productSearch, setProductSearch] = React.useState("");
    const filteredProducts = React.useMemo(() => {
        if (!productSearch.trim()) return TOP_SELLING_PRODUCTS;
        const q = productSearch.trim().toLowerCase();
        return TOP_SELLING_PRODUCTS.filter((p) => p.name.toLowerCase().includes(q));
    }, [productSearch]);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-zinc-100 text-lg font-semibold tracking-tight">Revenue & Debt</h1>
                <p className="text-zinc-500 mt-0.5 text-xs">Data-dense overview</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
                {OVERVIEW_METRICS.map((m) => {
                    const Icon = m.icon;
                    const accentCls = m.accent === "emerald" ? "text-emerald-400" : m.accent === "amber" ? "text-amber-400" : "text-zinc-600";
                    return (
                        <Card key={m.label} className="border-[0.5px] border-zinc-800 overflow-hidden bg-zinc-900">
                            <CardContent className="flex items-start justify-between p-3">
                                <div className="min-w-0">
                                    <p className="text-zinc-500 truncate text-[10px] font-medium">{m.label}</p>
                                    <p className={cn("mt-0.5 text-sm font-semibold tabular-nums", m.accent === "emerald" ? "text-emerald-400" : m.accent === "amber" ? "text-amber-400" : "text-zinc-100")}>{m.value}</p>
                                    <p className="text-zinc-600 mt-0.5 truncate text-[9px]">{m.sublabel}</p>
                                </div>
                                <Icon className={cn("size-3.5 shrink-0", accentCls)} />
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
                <Card className="border-[0.5px] border-zinc-800 overflow-hidden bg-zinc-900">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-zinc-100 text-sm font-semibold">Orders by Location</CardTitle>
                        <CardDescription className="text-zinc-500 text-[10px]">US map — darker = more orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OrdersMap />
                    </CardContent>
                </Card>
                <Card className="border-[0.5px] border-zinc-800 overflow-hidden bg-zinc-900">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-zinc-100 text-sm font-semibold">Sales vs Production</CardTitle>
                        <CardDescription className="text-zinc-500 text-[10px]">Monthly $</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[200px] w-full">
                            <BarChart data={SALES_VS_PRODUCTION} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                                <CartesianGrid strokeDasharray="2 2" stroke="var(--border)" opacity={0.5} vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                                <ChartTooltip content={<ChartTooltipContent formatter={(v) => [`$${v?.toLocaleString() ?? v}`]} />} />
                                <Bar dataKey="sales" fill="var(--chart-1)" radius={[2, 2, 0, 0]} barSize={24} />
                                <Bar dataKey="production" fill="var(--chart-2)" radius={[2, 2, 0, 0]} barSize={24} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card className="border-[0.5px] border-zinc-800 overflow-hidden bg-zinc-900">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-zinc-100 text-sm font-semibold">Alerts</CardTitle>
                        <CardDescription className="text-zinc-500 text-[10px]">Requires attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {OVERVIEW_ALERTS.map((a) => {
                                const isWarning = a.type === "warning";
                                const isAmber = a.type === "amber";
                                const Icon = isWarning ? AlertTriangle : isAmber ? AlertCircle : Info;
                                const borderCls = isWarning ? "border-amber-500/30" : isAmber ? "border-amber-500/30" : "border-zinc-700";
                                const iconCls = isWarning ? "text-amber-400" : isAmber ? "text-amber-400" : "text-zinc-500";
                                return (
                                    <div key={a.id} className={cn("rounded border px-2 py-1.5", borderCls)}>
                                        <div className="flex items-start gap-2">
                                            <Icon className={cn("mt-0.5 size-3 shrink-0", iconCls)} />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-zinc-200 text-[11px] font-medium">{a.title}</p>
                                                <p className="text-zinc-500 mt-0.5 text-[10px]">{a.msg}</p>
                                                <p className="text-zinc-600 mt-0.5 text-[9px]">{a.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-[0.5px] border-zinc-800 overflow-hidden bg-zinc-900">
                <CardHeader className="pb-2">
                    <CardTitle className="text-zinc-100 text-sm font-semibold">Conversion Funnel</CardTitle>
                    <CardDescription className="text-zinc-500 text-[10px]">Visitors → Purchased (this month)</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={conversionChartConfig} className="h-[180px] w-full">
                        <AreaChart data={CONVERSION_FUNNEL} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                            <defs>
                                <linearGradient id="conversionFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="2 2" stroke="var(--border)" opacity={0.5} vertical={false} />
                            <XAxis dataKey="stage" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} width={28} />
                            <ChartTooltip content={<ChartTooltipContent formatter={(v, name, item) => [`${v} (${item?.payload?.rate ?? ""} conv.)`]} />} />
                            <Area type="monotone" dataKey="count" stroke="var(--chart-1)" strokeWidth={1.5} fill="url(#conversionFill)" />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card className="border-[0.5px] border-zinc-800 overflow-hidden bg-zinc-900">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <CardTitle className="text-zinc-100 text-sm font-semibold">Top Selling Products</CardTitle>
                            <CardDescription className="text-zinc-500 text-[10px]">By units sold</CardDescription>
                        </div>
                        <div className="relative w-44">
                            <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                            <Input
                                placeholder="Search products…"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className="h-8 border-zinc-700 bg-zinc-950 pl-7 text-xs text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-500 h-8 px-3 text-[10px] w-8">#</TableHead>
                                <TableHead className="text-zinc-500 h-8 px-3 text-[10px]">Product</TableHead>
                                <TableHead className="text-zinc-500 h-8 px-3 text-[10px] text-right">Units</TableHead>
                                <TableHead className="text-zinc-500 h-8 px-3 text-[10px] text-right">Revenue</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.map((p, i) => (
                                <TableRow key={p.rank} className="border-zinc-800/50">
                                    <TableCell className="text-zinc-500 px-3 py-1.5 font-mono text-[10px]">{i + 1}</TableCell>
                                    <TableCell className="text-zinc-200 px-3 py-1.5 text-[11px] font-medium">{p.name}</TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-right tabular-nums text-[11px]">{p.units}</TableCell>
                                    <TableCell className="text-emerald-400 px-3 py-1.5 text-right tabular-nums text-[11px] font-medium">${p.revenue.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
