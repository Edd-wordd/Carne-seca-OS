'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { TicketPercent, CheckCircle2, Hash, CircleDollarSign, Download } from 'lucide-react';
import { exportCouponsToCsv } from '@/lib/utils/exportCoupons';
import { CouponKpiCard } from './CouponKpiCard';
import { CouponsTable } from './CouponsTable';

const moneyUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function CouponClient({ initialCoupons }) {
    const [query, setQuery] = React.useState('');
    const [filter, setFilter] = React.useState('all');

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        return initialCoupons.filter((c) => {
            if (filter === 'active' && c.status !== 'active') return false;
            if (filter === 'inactive' && c.status !== 'inactive') return false;
            if (!q) return true;
            const metaMatch =
                c.metadata &&
                Object.values(c.metadata).some(
                    (v) => v != null && String(v).toLowerCase().includes(q),
                );
            return (
                (c.code && c.code.toLowerCase().includes(q)) ||
                (c.id && c.id.toLowerCase().includes(q)) ||
                metaMatch
            );
        });
    }, [initialCoupons, filter, query]);

    const activeCount = initialCoupons.filter((c) => c.status === 'active').length;
    const totalRedemptions = initialCoupons.reduce((sum, c) => sum + (c.uses.redeemed ?? 0), 0);

    const totalRedemptionValueCents = 0;

    return (
        <>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <CouponKpiCard
                    label="Codes"
                    value={initialCoupons.length}
                    icon={TicketPercent}
                    iconClassName="text-indigo-400/80"
                />
                <CouponKpiCard
                    label="Active"
                    value={activeCount}
                    icon={CheckCircle2}
                    valueClassName="text-emerald-400"
                    iconClassName="text-emerald-400/80"
                />
                <CouponKpiCard
                    label="Total redemptions"
                    value={totalRedemptions.toLocaleString()}
                    icon={Hash}
                    iconClassName="text-zinc-500"
                />
                <CouponKpiCard
                    label="Total redemption value"
                    value={moneyUsd.format(totalRedemptionValueCents / 100)}
                    hint="Discount given (mock)"
                    icon={CircleDollarSign}
                    valueClassName="text-amber-400/95"
                    iconClassName="text-amber-400/80"
                />
            </div>

            <div className="flex justify-end">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2 border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                    onClick={() => exportCouponsToCsv(filtered)}
                >
                    <Download className="size-3.5" />
                    Export CSV
                </Button>
            </div>

            <CouponsTable
                coupons={filtered}
                query={query}
                onQueryChange={setQuery}
                filter={filter}
                onFilterChange={setFilter}
            />
        </>
    );
}
