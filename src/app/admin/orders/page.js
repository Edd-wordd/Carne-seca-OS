'use client';

import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Printer,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    ShoppingBag,
    Clock,
    DollarSign,
    RotateCcw,
    Download,
    Pencil,
    Plus,
    Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FULFILLMENT_OPTIONS = [
    { value: 'unfulfilled', label: 'Unfulfilled' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
];

// Mock orders data
const MOCK_ORDERS = [
    {
        id: 'ORD-1082',
        customer: 'Alex Rivera',
        date: '2025-02-17T14:32',
        status: 'shipped',
        fulfillment: 'shipped',
        tracking: '1Z999AA10123456784',
        total: 847,
        items: 3,
        refunded: false,
    },
    {
        id: 'ORD-1081',
        customer: 'Jordan Lee',
        date: '2025-02-16T09:15',
        status: 'delivered',
        fulfillment: 'delivered',
        tracking: '1Z999AA10123456783',
        total: 1242,
        items: 5,
        refunded: false,
    },
    {
        id: 'ORD-1080',
        customer: 'Sam Chen',
        date: '2025-02-16T09:15',
        status: 'processing',
        fulfillment: 'processing',
        tracking: '',
        total: 389,
        items: 1,
        refunded: false,
    },
    {
        id: 'ORD-1079',
        customer: 'Morgan Taylor',
        date: '2025-02-15T16:45',
        status: 'shipped',
        fulfillment: 'shipped',
        tracking: '1Z999AA10123456782',
        total: 621,
        items: 2,
        refunded: false,
    },
    {
        id: 'ORD-1078',
        customer: 'Riley Adams',
        date: '2025-02-15T16:45',
        status: 'pending',
        fulfillment: 'unfulfilled',
        tracking: '',
        total: 156,
        items: 1,
        refunded: false,
    },
    {
        id: 'ORD-1077',
        customer: 'Casey Kim',
        date: '2025-02-14T11:20',
        status: 'delivered',
        fulfillment: 'delivered',
        tracking: '1Z999AA10123456781',
        total: 934,
        items: 4,
        refunded: false,
    },
    {
        id: 'ORD-1076',
        customer: 'Drew Morgan',
        date: '2025-02-13T08:00',
        status: 'refunded',
        fulfillment: 'delivered',
        tracking: '',
        total: 428,
        items: 2,
        refunded: true,
    },
    {
        id: 'ORD-1075',
        customer: 'Quinn Blake',
        date: '2025-02-12T19:30',
        status: 'refunded',
        fulfillment: 'shipped',
        tracking: '',
        total: 612,
        items: 3,
        refunded: true,
    },
];

const STATUS_STYLES = {
    pending: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    processing: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
    shipped: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400',
    delivered: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    refunded: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
};

function escapeCsv(val) {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
    return s;
}

function formatCurrency(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
}

function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

const FULFILLMENT_TO_STATUS = {
    unfulfilled: 'pending',
    processing: 'processing',
    shipped: 'shipped',
    delivered: 'delivered',
};

function OrdersTable({ orders, hasActiveSearch, pagination, dateSortOrder, onDateSortToggle, searchQuery, setSearchQuery }) {
    const [packingSlipOrder, setPackingSlipOrder] = React.useState(null);
    const [fulfillmentState, setFulfillmentState] = React.useState({});
    const [statusState, setStatusState] = React.useState({});
    const [trackingState, setTrackingState] = React.useState({});
    const [editingTrackingId, setEditingTrackingId] = React.useState(null);

    const getFulfillment = (order) => fulfillmentState[order.id] ?? order.fulfillment;
    const getStatus = (order) => {
        if (order.refunded) return 'refunded';
        return statusState[order.id] ?? order.status;
    };
    const getTracking = (order) => trackingState[order.id] ?? order.tracking ?? '';

    const handleFulfillmentChange = (order, value) => {
        setFulfillmentState((s) => ({ ...s, [order.id]: value }));
        if (!order.refunded) {
            setStatusState((s) => ({ ...s, [order.id]: FULFILLMENT_TO_STATUS[value] ?? value }));
        }
    };

    const showTrackingInput = (order) => {
        const tracking = getTracking(order);
        return !tracking || editingTrackingId === order.id;
    };

    return (
        <>
            <div className="overflow-hidden rounded border border-zinc-700/80">
                <div className="border-b border-zinc-700/80 bg-zinc-900/80 px-3 py-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-zinc-100 text-xs font-medium">Orders</h2>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                            <Input
                                placeholder="Search orders…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-7 w-[160px] border-zinc-700 bg-zinc-950 pl-8 text-[10px] text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="border-zinc-700/80 hover:bg-transparent">
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Order ID</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Customer</TableHead>
                            <TableHead
                                className="text-zinc-400 h-8 px-3 text-[10px] cursor-pointer select-none hover:text-zinc-300 transition-colors"
                                onClick={onDateSortToggle}
                            >
                                <span className="flex w-full items-center justify-between">
                                    Date
                                    {dateSortOrder === 'asc' ? (
                                        <ChevronUp className="size-3.5 shrink-0" />
                                    ) : (
                                        <ChevronDown className="size-3.5 shrink-0" />
                                    )}
                                </span>
                            </TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Items</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Status</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Fulfillment</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px]">Tracking</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-3 text-[10px] text-right">Total</TableHead>
                            <TableHead className="text-zinc-400 h-8 px-2 text-[10px] w-12" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow className="border-zinc-700/80">
                                <TableCell colSpan={9} className="text-zinc-400 py-4 text-center text-[11px]">
                                    {hasActiveSearch ? 'No orders match your search or filters' : 'No orders'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow
                                    key={order.id}
                                    className="group border-zinc-700/80 transition-colors hover:!bg-zinc-700/50"
                                >
                                    <TableCell className="text-zinc-200 px-3 py-1.5 font-mono text-[11px] font-medium group-hover:text-zinc-100">
                                        {order.id}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] group-hover:text-zinc-300">
                                        {order.customer}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-[11px] tabular-nums group-hover:text-zinc-300">
                                        {formatDateTime(order.date)}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-3 py-1.5 text-center text-[11px] tabular-nums group-hover:text-zinc-300">
                                        {order.items ?? 0}
                                    </TableCell>
                                    <TableCell className="px-3 py-1.5">
                                        <span
                                            className={cn(
                                                'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize',
                                                STATUS_STYLES[getStatus(order)] || STATUS_STYLES.pending,
                                            )}
                                        >
                                            {getStatus(order)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-3 py-1.5">
                                        <Select
                                            value={getFulfillment(order)}
                                            onValueChange={(v) => handleFulfillmentChange(order, v)}
                                            disabled={order.refunded}
                                        >
                                            <SelectTrigger className="h-7 w-[120px] border-zinc-700 bg-zinc-950 text-zinc-100 text-[10px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {FULFILLMENT_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="px-3 py-1.5">
                                        {showTrackingInput(order) ? (
                                            <Input
                                                placeholder="Add tracking #"
                                                value={getTracking(order)}
                                                onChange={(e) =>
                                                    setTrackingState((s) => ({
                                                        ...s,
                                                        [order.id]: e.target.value,
                                                    }))
                                                }
                                                onBlur={() => setEditingTrackingId(null)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') setEditingTrackingId(null);
                                                }}
                                                className="h-7 w-[130px] border-zinc-700 bg-zinc-950 text-zinc-100 text-[10px]"
                                                autoFocus={editingTrackingId === order.id}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-zinc-400 text-[11px] font-mono truncate max-w-[120px] group-hover:text-zinc-300">
                                                    {getTracking(order)}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 shrink-0 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-700/50"
                                                    onClick={() => setEditingTrackingId(order.id)}
                                                    disabled={order.refunded}
                                                >
                                                    <Pencil className="size-3" />
                                                    <span className="sr-only">Edit tracking</span>
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-zinc-100 px-3 py-1.5 text-right text-[11px] font-medium tabular-nums group-hover:text-white">
                                        {formatCurrency(order.total)}
                                    </TableCell>
                                    <TableCell className="px-2 py-1.5">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-zinc-400 hover:text-indigo-300 hover:bg-zinc-600/50"
                                            onClick={() => setPackingSlipOrder(order)}
                                            disabled={order.refunded}
                                        >
                                            <Printer className="size-3.5" />
                                            <span className="sr-only">Print packing slip</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {pagination}
            </div>

            <Dialog open={!!packingSlipOrder} onOpenChange={(o) => !o && setPackingSlipOrder(null)}>
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Print Packing Slip</DialogTitle>
                        <DialogDescription>
                            {packingSlipOrder
                                ? `Generate packing slip for ${packingSlipOrder.id} — ${packingSlipOrder.customer}`
                                : ''}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-500">
                        Packing slip preview would render here. (Mock)
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setPackingSlipOrder(null)}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => setPackingSlipOrder(null)}
                            className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                        >
                            <Printer className="mr-2 size-3.5" />
                            Print
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

const PAGE_SIZE = 5;

const STATUS_FILTER_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'refunded', label: 'Refunded' },
];

const FULFILLMENT_FILTER_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'unfulfilled', label: 'Unfulfilled' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
];

const DATE_FILTER_OPTIONS = [
    { value: 'all', label: 'All dates' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This week' },
    { value: 'last_7', label: 'Last 7 days' },
    { value: 'this_month', label: 'This month' },
];

function getDateRangeLabel(value, dateFrom, dateTo) {
    const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (value === 'custom' && dateFrom && dateTo) {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
            return `${fmt(from)} - ${fmt(to)}`;
        }
    }
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (value === 'all') return 'All dates';
    if (value === 'today') return fmt(today);
    if (value === 'yesterday') {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        return fmt(y);
    }
    if (value === 'this_week') {
        const start = new Date(today);
        start.setDate(start.getDate() - start.getDay());
        return `${fmt(start)} - ${fmt(today)}`;
    }
    if (value === 'last_7') {
        const start = new Date(today);
        start.setDate(start.getDate() - 6);
        return `${fmt(start)} - ${fmt(today)}`;
    }
    if (value === 'this_month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return `${fmt(start)} - ${fmt(today)}`;
    }
    return 'All dates';
}

function filterOrdersBySearch(orders, query) {
    if (!query.trim()) return orders;
    const q = query.trim().toLowerCase();
    return orders.filter(
        (o) =>
            o.id.toLowerCase().includes(q) ||
            o.customer.toLowerCase().includes(q) ||
            o.date.includes(q) ||
            (o.tracking && o.tracking.toLowerCase().includes(q)),
    );
}

function getOrderDate(order) {
    const d = new Date(order.date);
    return isNaN(d.getTime()) ? null : d;
}

function applyOrderFilters(orders, statusFilter, fulfillmentFilter, dateFilter, dateFrom, dateTo) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const last7Start = new Date(todayStart);
    last7Start.setDate(last7Start.getDate() - 6);

    let rangeStart = null;
    let rangeEnd = null;
    if (dateFilter === 'custom' && dateFrom && dateTo) {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
            rangeStart = new Date(from.getFullYear(), from.getMonth(), from.getDate());
            rangeEnd = new Date(to.getFullYear(), to.getMonth(), to.getDate() + 1);
        }
    } else if (dateFilter === 'today') {
        rangeStart = todayStart;
        rangeEnd = todayEnd;
    } else if (dateFilter === 'yesterday') {
        rangeStart = yesterdayStart;
        rangeEnd = todayStart;
    } else if (dateFilter === 'this_week') {
        rangeStart = weekStart;
        rangeEnd = todayEnd;
    } else if (dateFilter === 'last_7') {
        rangeStart = last7Start;
        rangeEnd = todayEnd;
    } else if (dateFilter === 'this_month') {
        rangeStart = monthStart;
        rangeEnd = todayEnd;
    }

    return orders.filter((o) => {
        if (statusFilter !== 'all' && o.status !== statusFilter) return false;
        if (fulfillmentFilter !== 'all' && o.fulfillment !== fulfillmentFilter) return false;

        const orderDate = getOrderDate(o);
        if (!orderDate) return true;

        if (rangeStart && rangeEnd) {
            const t = orderDate.getTime();
            if (t < rangeStart.getTime() || t >= rangeEnd.getTime()) return false;
        }

        return true;
    });
}

function PaginationBar({ total, currentPage, pageSize, onPageChange }) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, total);

    if (total === 0) return null;

    return (
        <div className="flex w-full items-center justify-between gap-4 border-t border-zinc-800/80 px-4 py-3">
            <p className="text-zinc-500 text-xs">
                Showing {start + 1}–{end} of {total}
            </p>
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80"
                    onClick={() => onPageChange((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                >
                    <ChevronLeft className="size-3.5" />
                    Prev
                </Button>
                <span className="px-2 text-xs text-zinc-500">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80"
                    onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                >
                    Next
                    <ChevronRight className="size-3.5" />
                </Button>
            </div>
        </div>
    );
}

export default function OrdersPage() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('all');
    const [filterFulfillment, setFilterFulfillment] = React.useState('all');
    const [filterDate, setFilterDate] = React.useState('all');
    const [dateFrom, setDateFrom] = React.useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    });
    const [dateTo, setDateTo] = React.useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const [currentPage, setCurrentPage] = React.useState(1);
    const [dateSortOrder, setDateSortOrder] = React.useState('desc');
    const [createModalOpen, setCreateModalOpen] = React.useState(false);
    const [orders, setOrders] = React.useState(MOCK_ORDERS);
    const [newOrderCustomer, setNewOrderCustomer] = React.useState('');
    const [newOrderItems, setNewOrderItems] = React.useState(1);
    const [newOrderTotal, setNewOrderTotal] = React.useState('');
    const [newOrderFulfillment, setNewOrderFulfillment] = React.useState('unfulfilled');

    const allOrders = orders;

    const getNextOrderId = () => {
        const nums = orders.map((o) => parseInt(o.id.replace(/\D/g, ''), 10)).filter(Boolean);
        const max = nums.length ? Math.max(...nums) : 1082;
        return `ORD-${max + 1}`;
    };

    const handleCreateOrder = () => {
        const raw = String(newOrderTotal)
            .trim()
            .replace(/[^0-9.]/g, '');
        const total = Math.round(parseFloat(raw || 0) * 100) || 0;
        const status = FULFILLMENT_TO_STATUS[newOrderFulfillment] ?? 'pending';
        const newOrder = {
            id: getNextOrderId(),
            customer: newOrderCustomer.trim() || 'Unknown',
            date: new Date().toISOString().slice(0, 16),
            status,
            fulfillment: newOrderFulfillment,
            tracking: '',
            total,
            items: Math.max(1, newOrderItems),
            refunded: false,
        };
        setOrders((prev) => [newOrder, ...prev]);
        setCreateModalOpen(false);
        setNewOrderCustomer('');
        setNewOrderItems(1);
        setNewOrderTotal('');
        setNewOrderFulfillment('unfulfilled');
    };
    const pendingOrders = MOCK_ORDERS.filter((o) => !o.refunded && ['pending', 'processing'].includes(o.status));
    const refundedOrders = MOCK_ORDERS.filter((o) => o.refunded);

    const filteredOrders = React.useMemo(() => {
        const bySearch = filterOrdersBySearch(allOrders, searchQuery);
        return applyOrderFilters(bySearch, filterStatus, filterFulfillment, filterDate, dateFrom, dateTo);
    }, [allOrders, searchQuery, filterStatus, filterFulfillment, filterDate, dateFrom, dateTo]);

    const sortedOrders = React.useMemo(() => {
        return [...filteredOrders].sort((a, b) => {
            const da = new Date(a.date).getTime();
            const db = new Date(b.date).getTime();
            return dateSortOrder === 'asc' ? da - db : db - da;
        });
    }, [filteredOrders, dateSortOrder]);

    const toggleDateSort = React.useCallback(() => {
        setDateSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    }, []);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus, filterFulfillment, filterDate, dateFrom, dateTo]);

    const ordersForTab = sortedOrders;
    const totalPages = Math.max(1, Math.ceil(ordersForTab.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedOrders = ordersForTab.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const handleExportCsv = () => {
        const headers = [
            'Order ID',
            'Customer',
            'Date',
            'Items',
            'Status',
            'Fulfillment',
            'Tracking',
            'Total',
            'Refunded',
        ];
        const rows = sortedOrders.map((o) =>
            [
                o.id,
                o.customer,
                formatDateTime(o.date),
                o.items ?? 0,
                o.status,
                o.fulfillment,
                o.tracking ?? '',
                formatCurrency(o.total),
                o.refunded ? 'Yes' : 'No',
            ]
                .map(escapeCsv)
                .join(','),
        );
        const csv = [headers.map(escapeCsv).join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const orderMetrics = React.useMemo(() => {
        const total = allOrders.length;
        const pending = pendingOrders.length;
        const revenue = allOrders.filter((o) => !o.refunded).reduce((sum, o) => sum + o.total, 0);
        const refunded = refundedOrders.length;
        const refundedAmount = refundedOrders.reduce((sum, o) => sum + o.total, 0);
        return [
            {
                label: 'Total Orders',
                value: String(total),
                sublabel: 'All orders',
                icon: ShoppingBag,
                accent: 'neutral',
            },
            {
                label: 'Pending Fulfillment',
                value: String(pending),
                sublabel: 'Need action',
                icon: Clock,
                accent: pending > 0 ? 'amber' : 'neutral',
            },
            {
                label: 'Revenue',
                value: formatCurrency(revenue),
                sublabel: 'Active orders',
                icon: DollarSign,
                accent: 'emerald',
            },
            {
                label: 'Refunded',
                value: `${refunded} (${formatCurrency(refundedAmount)})`,
                sublabel: 'Orders',
                icon: RotateCcw,
                accent: refunded > 0 ? 'red' : 'neutral',
            },
        ];
    }, [allOrders, pendingOrders, refundedOrders]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-zinc-100 text-xl font-semibold tracking-tight">Order Command</h1>
                    <p className="text-zinc-500 mt-1 text-sm">Manage fulfillment and tracking</p>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="mt-2 h-9 gap-2 border-zinc-700/80 bg-zinc-900/80 pl-2.5 pr-2 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 text-xs font-normal"
                            >
                                <Calendar className="size-4 text-zinc-500" />
                                <span>{getDateRangeLabel(filterDate, dateFrom, dateTo)}</span>
                                <ChevronDown className="size-4 text-zinc-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="min-w-[200px] border-zinc-800 bg-zinc-900 text-zinc-100 p-2"
                        >
                            {DATE_FILTER_OPTIONS.map((opt) => (
                                <DropdownMenuItem
                                    key={opt.value}
                                    onClick={() => setFilterDate(opt.value)}
                                    className="cursor-pointer text-xs focus:bg-zinc-800 focus:text-zinc-100"
                                >
                                    {opt.label}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator className="my-2 bg-zinc-700" />
                            <div className="space-y-2 px-2 py-1">
                                <p className="text-[10px] font-medium text-zinc-400">Custom range</p>
                                <div className="grid gap-2">
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => {
                                            setDateFrom(e.target.value);
                                            setFilterDate('custom');
                                        }}
                                        className="h-8 border-zinc-700 bg-zinc-900/80 text-xs text-zinc-100"
                                    />
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => {
                                            setDateTo(e.target.value);
                                            setFilterDate('custom');
                                        }}
                                        className="h-8 border-zinc-700 bg-zinc-900/80 text-xs text-zinc-100"
                                    />
                                </div>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 text-xs"
                        onClick={handleExportCsv}
                    >
                        <Download className="size-3.5" />
                        Export CSV
                    </Button>
                    <Button
                        size="sm"
                        className="h-9 gap-1.5 bg-indigo-600 text-white hover:bg-indigo-500 text-xs shrink-0"
                        onClick={() => setCreateModalOpen(true)}
                    >
                        <Plus className="size-3.5" />
                        Create Order
                    </Button>
                </div>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
                {orderMetrics.map((m) => {
                    const Icon = m.icon;
                    const accentCls =
                        m.accent === 'emerald'
                            ? 'text-emerald-400/80'
                            : m.accent === 'amber'
                              ? 'text-amber-400/80'
                              : m.accent === 'red'
                                ? 'text-red-400/80'
                                : 'text-zinc-500';
                    const valueCls =
                        m.accent === 'emerald'
                            ? 'text-emerald-400'
                            : m.accent === 'amber'
                              ? 'text-amber-400'
                              : m.accent === 'red'
                                ? 'text-red-400'
                                : 'text-zinc-100';
                    return (
                        <div
                            key={m.label}
                            className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5"
                        >
                            <Icon className={cn('size-4 shrink-0', accentCls)} />
                            <div className="min-w-0">
                                <p className="truncate text-zinc-400 text-[10px]">{m.label}</p>
                                <p className={cn('text-sm font-semibold tabular-nums', valueCls)}>{m.value}</p>
                                <p className="mt-0.5 truncate text-zinc-500 text-[9px]">{m.sublabel}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {STATUS_FILTER_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFilterStatus(opt.value)}
                        className={cn(
                            'rounded border px-2.5 py-1.5 text-[10px] font-medium transition-colors shrink-0',
                            filterStatus === opt.value
                                ? 'border-zinc-500 bg-zinc-700/80 text-zinc-100'
                                : 'border-zinc-600/50 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500/50 hover:bg-zinc-700/50 hover:text-zinc-200',
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() =>
                        setFilterFulfillment(filterFulfillment === 'unfulfilled' ? 'all' : 'unfulfilled')
                    }
                    className={cn(
                        'rounded border px-2.5 py-1.5 text-[10px] font-medium transition-colors shrink-0',
                        filterFulfillment === 'unfulfilled'
                            ? 'border-zinc-500 bg-zinc-700/80 text-zinc-100'
                            : 'border-zinc-600/50 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500/50 hover:bg-zinc-700/50 hover:text-zinc-200',
                    )}
                >
                    Unfulfilled
                </button>
            </div>

            <div className="mt-4">
                <OrdersTable
                    orders={paginatedOrders}
                    hasActiveSearch={
                        !!searchQuery.trim() ||
                        filterStatus !== 'all' ||
                        filterFulfillment !== 'all' ||
                        filterDate !== 'all'
                    }
                    dateSortOrder={dateSortOrder}
                    onDateSortToggle={toggleDateSort}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    pagination={
                        <PaginationBar
                            total={filteredOrders.length}
                            currentPage={safePage}
                            pageSize={PAGE_SIZE}
                            onPageChange={setCurrentPage}
                        />
                    }
                />
            </div>

            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create Order</DialogTitle>
                        <DialogDescription>Add a new order manually.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Customer</label>
                            <Input
                                placeholder="Customer name"
                                value={newOrderCustomer}
                                onChange={(e) => setNewOrderCustomer(e.target.value)}
                                className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Items</label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={newOrderItems}
                                    onChange={(e) => setNewOrderItems(parseInt(e.target.value, 10) || 1)}
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Total ($)</label>
                                <Input
                                    placeholder="e.g. 12.50"
                                    value={newOrderTotal}
                                    onChange={(e) => setNewOrderTotal(e.target.value)}
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Fulfillment</label>
                            <Select value={newOrderFulfillment} onValueChange={setNewOrderFulfillment}>
                                <SelectTrigger className="border-zinc-700 bg-zinc-900/80 text-zinc-100">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {FULFILLMENT_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCreateModalOpen(false)}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleCreateOrder} className="bg-indigo-600 text-white hover:bg-indigo-500">
                            Create Order
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
