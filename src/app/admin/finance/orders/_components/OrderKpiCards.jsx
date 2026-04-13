'use client';

import * as React from 'react';
import { ShoppingBag, Clock, DollarSign, RotateCcw } from 'lucide-react';
import { formatPrice } from '@/lib/utils/helpers';
import { OrderKpiCard } from './OrderKpiCard';

export function OrderKpiCards({ allOrders = [] }) {
    const pendingOrders = React.useMemo(
        () => allOrders.filter((o) => !o.refunded && (o.status === 'pending' || o.status === 'processing')),
        [allOrders],
    );
    const refundedOrders = React.useMemo(() => allOrders.filter((o) => o.refunded), [allOrders]);

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
                value: formatPrice(revenue),
                sublabel: 'Total Revenue',
                icon: DollarSign,
                accent: 'emerald',
            },
            {
                label: 'Refunded',
                value: `${refunded} (${formatPrice(refundedAmount)})`,
                sublabel: 'Orders',
                icon: RotateCcw,
                accent: refunded > 0 ? 'red' : 'neutral',
            },
        ];
    }, [allOrders, pendingOrders, refundedOrders]);

    return (
        <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
            {orderMetrics.map((m) => (
                <OrderKpiCard key={m.label} {...m} />
            ))}
        </div>
    );
}
