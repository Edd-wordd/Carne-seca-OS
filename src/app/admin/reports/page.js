"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Printer, Download, FileText, Wrench, ShoppingBag, Box, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SUPPLY_CATEGORIES = [
    { value: "meat", label: "Meat" },
    { value: "equipment", label: "Equipment" },
    { value: "packaging", label: "Packaging" },
    { value: "seasoning", label: "Seasoning" },
    { value: "other", label: "Other" },
];

const PAYMENT_METHODS = [
    { value: "credit_card", label: "Credit Card" },
    { value: "debit_card", label: "Debit Card" },
    { value: "cash", label: "Cash" },
    { value: "check", label: "Check" },
    { value: "venmo", label: "Venmo" },
    { value: "zelle", label: "Zelle" },
    { value: "wire", label: "Wire Transfer" },
    { value: "other", label: "Other" },
];

const MOCK_SUPPLIES = [
    { id: "SUP-1", category: "meat", name: "Beef Brisket", quantity: 50, weight: 50, unit: "lb", unitCost: 8.20, purchasedFrom: "Restaurant Depot", paymentMethod: "debit_card", purchasedBy: "John", value: 410, lastPurchasedAt: "2025-02-14" },
    { id: "SUP-2", category: "equipment", name: "Vacuum Sealer Pro", quantity: 1, weight: null, unit: "ea", unitCost: 700, purchasedFrom: "WebstaurantStore", paymentMethod: "credit_card", purchasedBy: "Maria", value: 700, lastPurchasedAt: "2025-01-08" },
    { id: "SUP-3", category: "packaging", name: "Vacuum Bags 8x10", quantity: 420, weight: null, unit: "pcs", unitCost: 0.12, purchasedFrom: "Uline", paymentMethod: "credit_card", purchasedBy: "John", value: 50.40, lastPurchasedAt: "2025-02-10" },
    { id: "SUP-4", category: "seasoning", name: "Seasoning Mix Bulk", quantity: 15, weight: 15, unit: "lb", unitCost: 8.50, purchasedFrom: "Spice World", paymentMethod: "cash", purchasedBy: "Alex", value: 127.50, lastPurchasedAt: "2025-02-01" },
];

const MOCK_PURCHASE_HISTORY = [
    { id: "PH-1", date: "2025-02-14", name: "Beef Brisket", category: "meat", quantity: 50, weight: 50, purchasedFrom: "Restaurant Depot", paymentMethod: "debit_card", purchasedBy: "John", cost: 410 },
    { id: "PH-2", date: "2025-02-10", name: "Vacuum Bags 8x10", category: "packaging", quantity: 420, purchasedFrom: "Uline", paymentMethod: "credit_card", purchasedBy: "John", cost: 50.40 },
    { id: "PH-3", date: "2025-02-01", name: "Seasoning Mix Bulk", category: "seasoning", quantity: 15, weight: 15, purchasedFrom: "Spice World", paymentMethod: "cash", purchasedBy: "Alex", cost: 127.50 },
    { id: "PH-4", date: "2025-01-15", name: "Beef Brisket", category: "meat", quantity: 40, weight: 40, purchasedFrom: "Restaurant Depot", paymentMethod: "check", purchasedBy: "Maria", cost: 328 },
    { id: "PH-5", date: "2025-01-08", name: "Vacuum Sealer Pro", category: "equipment", quantity: 1, purchasedFrom: "WebstaurantStore", paymentMethod: "credit_card", purchasedBy: "Maria", cost: 700 },
    { id: "PH-6", date: "2024-12-12", name: "Beef Brisket", category: "meat", quantity: 45, weight: 45, purchasedFrom: "Restaurant Depot", paymentMethod: "debit_card", purchasedBy: "John", cost: 369 },
    { id: "PH-7", date: "2024-12-05", name: "Vacuum Bags 8x10", category: "packaging", quantity: 300, purchasedFrom: "Uline", paymentMethod: "credit_card", purchasedBy: "Maria", cost: 36 },
    { id: "PH-8", date: "2024-11-20", name: "Seasoning Mix Bulk", category: "seasoning", quantity: 12, weight: 12, purchasedFrom: "Spice World", paymentMethod: "cash", purchasedBy: "Alex", cost: 102 },
    { id: "PH-9", date: "2024-11-08", name: "Beef Brisket", category: "meat", quantity: 38, weight: 38, purchasedFrom: "Restaurant Depot", paymentMethod: "check", purchasedBy: "Maria", cost: 311.60 },
];

const MOCK_ORDERS = [
    { id: "ORD-1082", customer: "Alex Rivera", date: "2025-02-17", status: "shipped", total: 847, items: 3, source: "website" },
    { id: "ORD-1081", customer: "Jordan Lee", date: "2025-02-16", status: "delivered", total: 1242, items: 5, source: "amazon" },
    { id: "ORD-1080", customer: "Sam Chen", date: "2025-02-16", status: "processing", total: 389, items: 1, source: "website" },
    { id: "ORD-1079", customer: "Morgan Taylor", date: "2025-02-15", status: "shipped", total: 621, items: 2, source: "pos" },
    { id: "ORD-1078", customer: "Riley Adams", date: "2025-02-15", status: "pending", total: 156, items: 1, source: "website" },
    { id: "ORD-1077", customer: "Casey Kim", date: "2025-02-14", status: "delivered", total: 934, items: 4, source: "amazon" },
    { id: "ORD-1076", customer: "Drew Morgan", date: "2025-02-13", status: "refunded", total: 428, items: 2, source: "website" },
];

const MOCK_INVENTORY = [
    { id: "1", sku: "CS-PB-12", name: "Premium Brisket 12oz", stock: 84, lowThreshold: 20, value: 1260 },
    { id: "2", sku: "CS-SC-8", name: "Seasoned Classic 8oz", stock: 8, lowThreshold: 15, value: 88 },
    { id: "3", sku: "CS-O6", name: "Original 6oz", stock: 0, lowThreshold: 10, value: 0 },
    { id: "4", sku: "CS-LS", name: "Limited Smoked", stock: 45, lowThreshold: 20, value: 900 },
    { id: "5", sku: "CS-GH-6", name: "Garlic & Herb 6oz", stock: 32, lowThreshold: 15, value: 416 },
];

const REPORT_TYPES = [
    { value: "supplies", label: "Supplies Report", icon: Wrench, description: "Supply items, purchase history, and monthly spend" },
    { value: "orders", label: "Orders Report", icon: ShoppingBag, description: "Orders, revenue, and fulfillment status" },
    { value: "inventory", label: "Inventory Report", icon: Box, description: "Stock levels, value, and low-stock items" },
    { value: "sales", label: "Sales Report", icon: BarChart2, description: "Revenue by month and sales summary" },
];

function escapeCsv(val) {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
}

export default function ReportsPage() {
    const [reportType, setReportType] = React.useState("supplies");
    const reportRef = React.useRef(null);

    const handlePrint = () => {
        window.print();
    };

    const handleExportCsv = () => {
        let csv = "";
        let filename = `report-${new Date().toISOString().slice(0, 10)}.csv`;
        if (reportType === "supplies") {
            const supplyHeaders = ["Item", "Category", "Qty/Weight", "Purchased From", "Payment", "Purchased By", "Last Purchased", "Value"];
            const supplyRows = MOCK_SUPPLIES.map((s) => {
                const cat = SUPPLY_CATEGORIES.find((c) => c.value === s.category)?.label ?? s.category;
                const qtyWeight = s.weight != null ? `${s.quantity} ${s.unit} (${s.weight} lb)` : `${s.quantity} ${s.unit}`;
                const pay = PAYMENT_METHODS.find((p) => p.value === s.paymentMethod)?.label ?? s.paymentMethod ?? "";
                return [s.name, cat, qtyWeight, s.purchasedFrom, pay, s.purchasedBy ?? "", s.lastPurchasedAt, s.value.toFixed(2)].map(escapeCsv).join(",");
            });
            const historyHeaders = ["Date", "Item", "Category", "Qty", "Weight", "Purchased From", "Payment", "Purchased By", "Cost"];
            const historyRows = MOCK_PURCHASE_HISTORY.map((h) => {
                const cat = SUPPLY_CATEGORIES.find((c) => c.value === h.category)?.label ?? h.category;
                const pay = PAYMENT_METHODS.find((p) => p.value === h.paymentMethod)?.label ?? h.paymentMethod ?? "";
                return [h.date, h.name, cat, h.quantity, h.weight ?? "", h.purchasedFrom, pay, h.purchasedBy ?? "", h.cost.toFixed(2)].map(escapeCsv).join(",");
            });
            csv = [
                "Supply Items",
                supplyHeaders.map(escapeCsv).join(","),
                ...supplyRows,
                "",
                "Purchase History",
                historyHeaders.map(escapeCsv).join(","),
                ...historyRows,
            ].join("\n");
            filename = `supplies-report-${new Date().toISOString().slice(0, 10)}.csv`;
        } else if (reportType === "orders") {
            const headers = ["Order ID", "Date", "Customer", "Status", "Source", "Items", "Total"];
            const rows = MOCK_ORDERS.map((o) =>
                [o.id, o.date, o.customer, o.status, o.source, o.items, o.total.toFixed(2)].map(escapeCsv).join(","),
            );
            csv = [headers.map(escapeCsv).join(","), ...rows].join("\n");
            filename = `orders-report-${new Date().toISOString().slice(0, 10)}.csv`;
        } else if (reportType === "inventory") {
            const headers = ["SKU", "Product", "Stock", "Low Threshold", "Status", "Value"];
            const rows = MOCK_INVENTORY.map((i) => {
                const status = i.stock === 0 ? "Out of stock" : i.stock <= i.lowThreshold ? "Low" : "OK";
                return [i.sku, i.name, i.stock, i.lowThreshold, status, i.value.toFixed(2)].map(escapeCsv).join(",");
            });
            csv = [headers.map(escapeCsv).join(","), ...rows].join("\n");
            filename = `inventory-report-${new Date().toISOString().slice(0, 10)}.csv`;
        } else if (reportType === "sales") {
            const byMonth = salesByMonth;
            const headers = ["Month", "Revenue", "Orders"];
            const rows = byMonth.map((m) => [m.month, m.total.toFixed(2), m.count].map(escapeCsv).join(","));
            csv = [headers.map(escapeCsv).join(","), ...rows].join("\n");
            filename = `sales-report-${new Date().toISOString().slice(0, 10)}.csv`;
        } else return;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const byMonth = React.useMemo(() => {
        const acc = {};
        MOCK_PURCHASE_HISTORY.forEach((h) => {
            const m = h.date.slice(0, 7);
            acc[m] = (acc[m] || 0) + h.cost;
        });
        return Object.entries(acc)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, total]) => {
                const [y, mo] = month.split("-");
                return { month: new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" }), total };
            });
    }, []);

    const salesByMonth = React.useMemo(() => {
        const acc = {};
        MOCK_ORDERS.filter((o) => o.status !== "refunded").forEach((o) => {
            const m = o.date.slice(0, 7);
            if (!acc[m]) acc[m] = { total: 0, count: 0 };
            acc[m].total += o.total;
            acc[m].count += 1;
        });
        return Object.entries(acc)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, data]) => {
                const [y, mo] = month.split("-");
                return {
                    month: new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
                    total: data.total,
                    count: data.count,
                };
            });
    }, []);

    const totalValue = MOCK_SUPPLIES.reduce((s, x) => s + x.value, 0);
    const totalInventoryValue = MOCK_INVENTORY.reduce((s, x) => s + x.value, 0);
    const lowStockCount = MOCK_INVENTORY.filter((i) => i.stock <= i.lowThreshold).length;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-zinc-100 text-lg font-semibold tracking-tight">Reports</h1>
                    <p className="text-zinc-500 mt-0.5 text-xs">Print and export reports for your records</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger className="w-[200px] border-zinc-700 bg-zinc-900 text-zinc-100 text-xs h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {REPORT_TYPES.map((r) => (
                                <SelectItem key={r.value} value={r.value} className="text-xs">
                                    <span className="flex items-center gap-2">
                                        <r.icon className="size-3.5" />
                                        {r.label}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" className="gap-1.5 border-zinc-700 text-zinc-300 h-8 text-xs print:hidden" onClick={handlePrint}>
                        <Printer className="size-3.5" />
                        Print
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 border-zinc-700 text-zinc-300 h-8 text-xs print:hidden" onClick={handleExportCsv}>
                        <Download className="size-3.5" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {reportType === "supplies" && (
                <div ref={reportRef} className="rounded border border-zinc-800 bg-zinc-900/60 p-6 text-zinc-100 print:border print:bg-white print:text-zinc-900">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold">Supplies Report</h2>
                            <p className="text-zinc-500 text-sm">Carne Seca · Generated {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium mb-2">Summary</h3>
                            <p className="text-sm">Total supply value: <strong>${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></p>
                            <p className="text-sm text-zinc-500 mt-1">Monthly spend (last {byMonth.length} months): {byMonth.map((m) => `${m.month}: $${m.total.toFixed(0)}`).join(", ")}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium mb-2">Supply Items</h3>
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-700 print:border-zinc-400">
                                        <th className="text-left py-2 px-2">Item</th>
                                        <th className="text-left py-2 px-2">Category</th>
                                        <th className="text-left py-2 px-2">Qty</th>
                                        <th className="text-left py-2 px-2">Purchased From</th>
                                        <th className="text-left py-2 px-2">Payment</th>
                                        <th className="text-left py-2 px-2">Purchased By</th>
                                        <th className="text-left py-2 px-2">Last Purchased</th>
                                        <th className="text-right py-2 px-2">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MOCK_SUPPLIES.map((s) => {
                                        const cat = SUPPLY_CATEGORIES.find((c) => c.value === s.category)?.label ?? s.category;
                                        const qtyWeight = s.weight != null ? `${s.quantity} ${s.unit} (${s.weight} lb)` : `${s.quantity} ${s.unit}`;
                                        const pay = PAYMENT_METHODS.find((p) => p.value === s.paymentMethod)?.label ?? s.paymentMethod ?? "";
                                        return (
                                            <tr key={s.id} className="border-b border-zinc-800/50 print:border-zinc-300">
                                                <td className="py-1.5 px-2">{s.name}</td>
                                                <td className="py-1.5 px-2">{cat}</td>
                                                <td className="py-1.5 px-2">{qtyWeight}</td>
                                                <td className="py-1.5 px-2">{s.purchasedFrom}</td>
                                                <td className="py-1.5 px-2">{pay}</td>
                                                <td className="py-1.5 px-2">{s.purchasedBy ?? "—"}</td>
                                                <td className="py-1.5 px-2">{s.lastPurchasedAt}</td>
                                                <td className="py-1.5 px-2 text-right tabular-nums">${s.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium mb-2">Purchase History</h3>
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-700 print:border-zinc-400">
                                        <th className="text-left py-2 px-2">Date</th>
                                        <th className="text-left py-2 px-2">Item</th>
                                        <th className="text-left py-2 px-2">Category</th>
                                        <th className="text-left py-2 px-2">Qty</th>
                                        <th className="text-left py-2 px-2">Purchased From</th>
                                        <th className="text-left py-2 px-2">Payment</th>
                                        <th className="text-left py-2 px-2">Purchased By</th>
                                        <th className="text-right py-2 px-2">Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...MOCK_PURCHASE_HISTORY]
                                        .sort((a, b) => b.date.localeCompare(a.date))
                                        .map((h) => {
                                            const cat = SUPPLY_CATEGORIES.find((c) => c.value === h.category)?.label ?? h.category;
                                            const pay = PAYMENT_METHODS.find((p) => p.value === h.paymentMethod)?.label ?? h.paymentMethod ?? "";
                                            return (
                                                <tr key={h.id} className="border-b border-zinc-800/50 print:border-zinc-300">
                                                    <td className="py-1.5 px-2">{h.date}</td>
                                                    <td className="py-1.5 px-2">{h.name}</td>
                                                    <td className="py-1.5 px-2">{cat}</td>
                                                    <td className="py-1.5 px-2">{h.quantity}{h.weight != null ? ` (${h.weight} lb)` : ""}</td>
                                                    <td className="py-1.5 px-2">{h.purchasedFrom}</td>
                                                    <td className="py-1.5 px-2">{pay}</td>
                                                    <td className="py-1.5 px-2">{h.purchasedBy ?? "—"}</td>
                                                    <td className="py-1.5 px-2 text-right tabular-nums">${h.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {reportType === "orders" && (
                <div ref={reportRef} className="rounded border border-zinc-800 bg-zinc-900/60 p-6 text-zinc-100 print:border print:bg-white print:text-zinc-900">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold">Orders Report</h2>
                            <p className="text-zinc-500 text-sm">Carne Seca · Generated {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium mb-2">Summary</h3>
                            <p className="text-sm">
                                Total revenue (non-refunded): <strong>${MOCK_ORDERS.filter((o) => o.status !== "refunded").reduce((s, o) => s + o.total, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                            </p>
                            <p className="text-sm text-zinc-500 mt-1">
                                Orders: {MOCK_ORDERS.length} · By status: {[...new Set(MOCK_ORDERS.map((o) => o.status))].join(", ")}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium mb-2">Orders</h3>
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-700 print:border-zinc-400">
                                        <th className="text-left py-2 px-2">Order ID</th>
                                        <th className="text-left py-2 px-2">Date</th>
                                        <th className="text-left py-2 px-2">Customer</th>
                                        <th className="text-left py-2 px-2">Status</th>
                                        <th className="text-left py-2 px-2">Source</th>
                                        <th className="text-left py-2 px-2">Items</th>
                                        <th className="text-right py-2 px-2">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...MOCK_ORDERS]
                                        .sort((a, b) => b.date.localeCompare(a.date))
                                        .map((o) => (
                                            <tr key={o.id} className="border-b border-zinc-800/50 print:border-zinc-300">
                                                <td className="py-1.5 px-2">{o.id}</td>
                                                <td className="py-1.5 px-2">{o.date}</td>
                                                <td className="py-1.5 px-2">{o.customer}</td>
                                                <td className="py-1.5 px-2">{o.status}</td>
                                                <td className="py-1.5 px-2">{o.source}</td>
                                                <td className="py-1.5 px-2">{o.items}</td>
                                                <td className="py-1.5 px-2 text-right tabular-nums">${o.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {reportType === "inventory" && (
                <div ref={reportRef} className="rounded border border-zinc-800 bg-zinc-900/60 p-6 text-zinc-100 print:border print:bg-white print:text-zinc-900">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold">Inventory Report</h2>
                            <p className="text-zinc-500 text-sm">Carne Seca · Generated {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium mb-2">Summary</h3>
                            <p className="text-sm">
                                Total inventory value: <strong>${totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                            </p>
                            <p className="text-sm text-zinc-500 mt-1">
                                Products: {MOCK_INVENTORY.length} · Low stock: {lowStockCount} · Out of stock: {MOCK_INVENTORY.filter((i) => i.stock === 0).length}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium mb-2">Inventory Items</h3>
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-700 print:border-zinc-400">
                                        <th className="text-left py-2 px-2">SKU</th>
                                        <th className="text-left py-2 px-2">Product</th>
                                        <th className="text-left py-2 px-2">Stock</th>
                                        <th className="text-left py-2 px-2">Low Threshold</th>
                                        <th className="text-left py-2 px-2">Status</th>
                                        <th className="text-right py-2 px-2">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MOCK_INVENTORY.map((i) => {
                                        const status = i.stock === 0 ? "Out of stock" : i.stock <= i.lowThreshold ? "Low" : "OK";
                                        return (
                                            <tr key={i.id} className="border-b border-zinc-800/50 print:border-zinc-300">
                                                <td className="py-1.5 px-2">{i.sku}</td>
                                                <td className="py-1.5 px-2">{i.name}</td>
                                                <td className="py-1.5 px-2">{i.stock}</td>
                                                <td className="py-1.5 px-2">{i.lowThreshold}</td>
                                                <td className="py-1.5 px-2">{status}</td>
                                                <td className="py-1.5 px-2 text-right tabular-nums">${i.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {reportType === "sales" && (
                <div ref={reportRef} className="rounded border border-zinc-800 bg-zinc-900/60 p-6 text-zinc-100 print:border print:bg-white print:text-zinc-900">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold">Sales Report</h2>
                            <p className="text-zinc-500 text-sm">Carne Seca · Generated {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium mb-2">Summary</h3>
                            <p className="text-sm">
                                Total revenue (YTD): <strong>${salesByMonth.reduce((s, m) => s + m.total, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                            </p>
                            <p className="text-sm text-zinc-500 mt-1">
                                Total orders: {salesByMonth.reduce((s, m) => s + m.count, 0)}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium mb-2">Revenue by Month</h3>
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-700 print:border-zinc-400">
                                        <th className="text-left py-2 px-2">Month</th>
                                        <th className="text-right py-2 px-2">Orders</th>
                                        <th className="text-right py-2 px-2">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesByMonth.map((m, i) => (
                                        <tr key={i} className="border-b border-zinc-800/50 print:border-zinc-300">
                                            <td className="py-1.5 px-2">{m.month}</td>
                                            <td className="py-1.5 px-2 text-right tabular-nums">{m.count}</td>
                                            <td className="py-1.5 px-2 text-right tabular-nums">${m.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {!["supplies", "orders", "inventory", "sales"].includes(reportType) && (
                <div className="rounded border border-zinc-800 bg-zinc-900/60 p-8 text-center text-zinc-500 text-sm print:hidden">
                    <FileText className="size-8 mx-auto mb-2 opacity-50" />
                    Select a report type above to view and export.
                </div>
            )}
        </div>
    );
}
