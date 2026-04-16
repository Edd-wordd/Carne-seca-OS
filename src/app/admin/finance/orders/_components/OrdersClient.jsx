'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { ChevronLeft, ChevronRight, Download, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { exportOrdersToCsv } from '@/lib/utils/exportOrders';
import { toast } from 'sonner';
import { OrderKpiCards } from './OrderKpiCards';
import { CreateOrderDialog } from './CreateOrderDialog';
import { getProducts } from '@/lib/supabase/queries/catalog/getProducts';
import { createOrder } from '@/app/actions/orders/createOrder';
import {
    OrdersTable,
    ORDER_SOURCES,
    formatAddress,
    FULFILLMENT_TO_STATUS,
    normalizeFulfillmentValue,
    orderStatusForFilter,
} from './OrdersTable';
import { normalizeOrderFromDb } from '@/lib/utils/helpers';

function newCreateOrderLineKey() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeProductsFetch(data) {
    return Array.isArray(data) ? data : [];
}

function isProductOrderable(p) {
    return String(p?.status ?? '').toLowerCase() === 'active';
}

function formatProductLineName(product) {
    const name = String(product?.name ?? '').trim() || 'Product';
    const flavor = String(product?.flavor ?? '').trim();
    return flavor ? `${name} (${flavor})` : name;
}

function computeCreateOrderPreview(lines, products) {
    const active = products.filter(isProductOrderable);
    const byId = new Map(active.map((p) => [String(p.id), p]));
    let totalCents = 0;
    let unitCount = 0;
    for (const line of lines) {
        const p = byId.get(String(line.productId));
        const qty = Math.max(0, parseInt(String(line.quantity), 10) || 0);
        if (!p || qty <= 0) continue;
        const unit = Math.round(Number(p.price_cents) || 0);
        totalCents += unit * qty;
        unitCount += qty;
    }
    return { totalCents, unitCount, hasValidLine: unitCount > 0 };
}

const PAGE_SIZE = 5;

const STATUS_FILTER_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'refunded', label: 'Refunded' },
];

function filterOrdersBySearch(orders, query) {
    if (!query.trim()) return orders;
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
        const sourceLabel = ORDER_SOURCES.find((s) => s.value === (o.source ?? 'website'))?.label?.toLowerCase() ?? '';
        const addrBlob = formatAddress(o.shipping_address).toLowerCase();
        const displayId =
            o.order_number != null && o.order_number !== '' ? String(o.order_number) : String(o.id ?? '').slice(0, 8);
        const lineNames = (o.order_items ?? []).map((li) => (li.product_name ?? '').toLowerCase()).join(' ');
        const created = String(o.created_at ?? '');
        return (
            String(o.id ?? '')
                .toLowerCase()
                .includes(q) ||
            displayId.toLowerCase().includes(q) ||
            o.customer_name.toLowerCase().includes(q) ||
            (o.customer_email && o.customer_email.toLowerCase().includes(q)) ||
            sourceLabel.includes(q) ||
            addrBlob.includes(q) ||
            lineNames.includes(q) ||
            created.toLowerCase().includes(q) ||
            (o.tracking_number && o.tracking_number.toLowerCase().includes(q))
        );
    });
}

function getOrderDate(order) {
    const d = new Date(order.created_at);
    return isNaN(d.getTime()) ? null : d;
}

function applyOrderFilters(orders, statusFilter, fulfillmentFilter, dateRange) {
    return orders.filter((o) => {
        if (statusFilter !== 'all' && orderStatusForFilter(o) !== statusFilter) return false;
        if (fulfillmentFilter !== 'all' && normalizeFulfillmentValue(o.fulfillment_status) !== fulfillmentFilter)
            return false;

        const orderDate = getOrderDate(o);
        if (!orderDate) return true;

        if (dateRange?.from) {
            const startOfDay = new Date(dateRange.from);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
            endOfDay.setHours(23, 59, 59, 999);
            const t = orderDate.getTime();
            if (t < startOfDay.getTime() || t > endOfDay.getTime()) return false;
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

export function OrdersClient({ initialOrders = [] }) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('all');
    const [filterFulfillment, setFilterFulfillment] = React.useState('all');
    const [dateRange, setDateRange] = React.useState({ from: undefined, to: undefined });
    const [currentPage, setCurrentPage] = React.useState(1);
    const [dateSortOrder, setDateSortOrder] = React.useState('desc');
    const [createModalOpen, setCreateModalOpen] = React.useState(false);
    const [orders, setOrders] = React.useState(() => {
        const raw =
            typeof structuredClone === 'function'
                ? structuredClone(initialOrders)
                : JSON.parse(JSON.stringify(initialOrders));
        return Array.isArray(raw) ? raw : [];
    });
    const [catalogProducts, setCatalogProducts] = React.useState([]);
    const [catalogLoading, setCatalogLoading] = React.useState(false);
    const [catalogError, setCatalogError] = React.useState(null);
    const [isCreatePending, setIsCreatePending] = React.useState(false);
    const [createOrderLines, setCreateOrderLines] = React.useState(() => [
        { key: newCreateOrderLineKey(), productId: '', quantity: 1 },
    ]);
    const [newOrderForm, setNewOrderForm] = React.useState({
        customer: '',
        email: '',
        fulfillment: 'unfulfilled',
        source: 'website',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        country: '',
    });

    const resetNewOrderForm = () => {
        setNewOrderForm({
            customer: '',
            email: '',
            fulfillment: 'unfulfilled',
            source: 'website',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            zip: '',
            country: '',
        });
        setCreateOrderLines([{ key: newCreateOrderLineKey(), productId: '', quantity: 1 }]);
    };

    React.useEffect(() => {
        if (!createModalOpen) return undefined;
        let cancelled = false;
        setCatalogLoading(true);
        setCatalogError(null);
        getProducts()
            .then((data) => {
                if (cancelled) return;
                setCatalogProducts(normalizeProductsFetch(data?.data));
            })
            .catch(() => {
                if (!cancelled) {
                    setCatalogError('Could not load catalog');
                    setCatalogProducts([]);
                }
            })
            .finally(() => {
                if (!cancelled) setCatalogLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [createModalOpen]);

    const createPreview = React.useMemo(
        () => computeCreateOrderPreview(createOrderLines, catalogProducts),
        [createOrderLines, catalogProducts],
    );

    const orderableCatalog = React.useMemo(
        () =>
            [...catalogProducts]
                .filter(isProductOrderable)
                .sort((a, b) => String(a.name).localeCompare(String(b.name))),
        [catalogProducts],
    );

    const allOrders = orders;

    const handleCreateOrder = async () => {
        if (isCreatePending) return;
        const byId = new Map(orderableCatalog.map((p) => [String(p.id), p]));
        const merged = new Map();
        for (const line of createOrderLines) {
            const p = byId.get(String(line.productId));
            const qty = Math.max(0, parseInt(String(line.quantity), 10) || 0);
            if (!p || qty <= 0) continue;
            const id = String(p.id);
            const unitPriceCents = Math.round(Number(p.price_cents) || 0);
            const prev = merged.get(id);
            if (prev) prev.quantity += qty;
            else merged.set(id, { product: p, quantity: qty, unitPriceCents });
        }
        const order_items = [...merged.values()].map(({ product, quantity, unitPriceCents }) => ({
            product_name: formatProductLineName(product),
            quantity,
            price_at_purchase: unitPriceCents,
            product_id: product.id,
        }));
        if (!order_items.length) return;

        const amount_total = order_items.reduce((s, li) => s + li.quantity * li.price_at_purchase, 0);
        const items = order_items.reduce((s, li) => s + li.quantity, 0);
        const fulfillment = newOrderForm.fulfillment ?? 'unfulfilled';
        const status = FULFILLMENT_TO_STATUS[fulfillment] ?? 'pending';
        const line2 = (newOrderForm.addressLine2 ?? '').trim();
        const shipping_address = {
            line1: (newOrderForm.addressLine1 ?? '').trim(),
            ...(line2 ? { line2 } : {}),
            city: (newOrderForm.city ?? '').trim(),
            state: (newOrderForm.state ?? '').trim(),
            zip: (newOrderForm.zip ?? '').trim(),
            country: (newOrderForm.country ?? '').trim(),
        };
        const rpcLineItems = order_items.map((li) => ({
            product_id: li.product_id,
            quantity: li.quantity,
        }));

        setIsCreatePending(true);
        try {
            const result = await createOrder({
                name: (newOrderForm.customer ?? '').trim() || 'Unknown',
                email: (newOrderForm.email ?? '').trim(),
                source: newOrderForm.source === 'pos' ? 'pos' : 'website',
                fulfillment,
                address: shipping_address,
                items: rpcLineItems,
            });

            if (!result?.success) {
                toast.error(result?.message ?? 'Failed to create order');
                return;
            }

            const newId =
                typeof result?.data === 'string'
                    ? result.data
                    : typeof crypto !== 'undefined' && crypto.randomUUID
                      ? crypto.randomUUID()
                      : `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

            setOrders((prev) => {
                const nums = prev
                    .map((o) => parseInt(String(o.order_number ?? '').replace(/\D/g, ''), 10))
                    .filter((n) => !isNaN(n) && n > 0);
                const nextOrderNum = nums.length ? Math.max(...nums) + 1 : 1083;
                return [
                    normalizeOrderFromDb({
                        id: newId,
                        order_number: String(nextOrderNum),
                        customer_name: (newOrderForm.customer ?? '').trim() || 'Unknown',
                        customer_email: (newOrderForm.email ?? '').trim(),
                        created_at: new Date().toISOString(),
                        status,
                        fulfillment_status: fulfillment,
                        tracking_number: '',
                        amount_total,
                        items,
                        refunded: false,
                        source: newOrderForm.source === 'pos' ? 'pos' : 'website',
                        shipping_address,
                        order_items,
                        stripe_payment_intent_id: null,
                        amount_discount: 0,
                        promo_code: '',
                    }),
                    ...prev,
                ];
            });
            toast.success('Order created');
            setCreateModalOpen(false);
            resetNewOrderForm();
        } finally {
            setIsCreatePending(false);
        }
    };

    const updateCreateLine = (key, patch) => {
        setCreateOrderLines((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
    };

    const addCreateOrderLine = () => {
        setCreateOrderLines((rows) => [...rows, { key: newCreateOrderLineKey(), productId: '', quantity: 1 }]);
    };

    const removeCreateOrderLine = (key) => {
        setCreateOrderLines((rows) => {
            const next = rows.filter((r) => r.key !== key);
            return next.length ? next : [{ key: newCreateOrderLineKey(), productId: '', quantity: 1 }];
        });
    };

    const handleUpdateOrder = React.useCallback((id, updates) => {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
    }, []);

    const filteredOrders = React.useMemo(() => {
        const bySearch = filterOrdersBySearch(allOrders, searchQuery);
        return applyOrderFilters(bySearch, filterStatus, filterFulfillment, dateRange);
    }, [allOrders, searchQuery, filterStatus, filterFulfillment, dateRange]);

    const sortedOrders = React.useMemo(() => {
        return [...filteredOrders].sort((a, b) => {
            const da = new Date(a.created_at).getTime();
            const db = new Date(b.created_at).getTime();
            return dateSortOrder === 'asc' ? da - db : db - da;
        });
    }, [filteredOrders, dateSortOrder]);

    const toggleDateSort = React.useCallback(() => {
        setDateSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    }, []);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus, filterFulfillment, dateRange]);

    const ordersForTab = sortedOrders;
    const totalPages = Math.max(1, Math.ceil(ordersForTab.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedOrders = ordersForTab.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const handleExportCsv = () => exportOrdersToCsv(sortedOrders);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-zinc-100 text-xl font-semibold tracking-tight">Order Command</h1>
                    <p className="text-zinc-500 mt-1 text-sm">Manage fulfillment and tracking</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        size="sm"
                        className="h-9 gap-1.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs shrink-0"
                        onClick={() => setCreateModalOpen(true)}
                    >
                        <Plus className="size-3.5" />
                        Create Order
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Overview</span>
                    <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                </div>
                <OrderKpiCards allOrders={allOrders} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                    <div className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
                        {STATUS_FILTER_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setFilterStatus(opt.value)}
                                className={cn(
                                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                                    filterStatus === opt.value
                                        ? 'bg-zinc-700 text-zinc-100'
                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50',
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
                        {[
                            { value: 'all', label: 'All' },
                            { value: 'unfulfilled', label: 'Unfulfilled' },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setFilterFulfillment(opt.value)}
                                className={cn(
                                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                                    filterFulfillment === opt.value
                                        ? 'bg-zinc-700 text-zinc-100'
                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50',
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                    onClick={handleExportCsv}
                >
                    <Download className="size-4" />
                    Export CSV
                </Button>
            </div>

            <div className="mt-4">
                <OrdersTable
                    orders={paginatedOrders}
                    allOrders={sortedOrders}
                    hasActiveSearch={
                        !!searchQuery.trim() ||
                        filterStatus !== 'all' ||
                        filterFulfillment !== 'all' ||
                        !!dateRange?.from
                    }
                    dateSortOrder={dateSortOrder}
                    onDateSortToggle={toggleDateSort}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onUpdateOrder={handleUpdateOrder}
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

            <CreateOrderDialog
                open={createModalOpen}
                onOpenChange={(open) => {
                    setCreateModalOpen(open);
                    if (!open) resetNewOrderForm();
                }}
                newOrderForm={newOrderForm}
                setNewOrderForm={setNewOrderForm}
                createOrderLines={createOrderLines}
                catalogLoading={catalogLoading}
                catalogError={catalogError}
                orderableCatalog={orderableCatalog}
                createPreview={createPreview}
                updateCreateLine={updateCreateLine}
                addCreateOrderLine={addCreateOrderLine}
                removeCreateOrderLine={removeCreateOrderLine}
                formatProductLineName={formatProductLineName}
                isCreatePending={isCreatePending}
                onSubmit={handleCreateOrder}
            />
        </div>
    );
}
