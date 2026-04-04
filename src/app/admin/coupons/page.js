'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { TicketPercent, CheckCircle2, Hash, CircleDollarSign, Download } from 'lucide-react';
import { exportCouponsToCsv } from '@/lib/utils/exportCoupons';
import { CouponKpiCard } from './_components/CouponKpiCard';
import { CouponsTable } from './_components/CouponsTable';

const MOCK_COUPONS = [
    {
        id: 'cpn-1',
        code: 'WELCOME10',
        type: 'percent',
        value: 10,
        maxRedemptions: 500,
        redemptions: 184,
        redeemedValueCents: 83_120, // total discount given across redemptions (mock)
        expiresAt: '2026-12-31',
        active: true,
        note: 'New customers · one per email',
    },
    {
        id: 'cpn-2',
        code: 'RESTOCK5',
        type: 'fixed',
        valueCents: 500,
        maxRedemptions: null,
        redemptions: 42,
        redeemedValueCents: 21_000, // $5 × 42
        expiresAt: '2026-06-01',
        active: true,
        note: '$5 off orders $35+',
    },
    {
        id: 'cpn-3',
        code: 'VIP20',
        type: 'percent',
        value: 20,
        maxRedemptions: 100,
        redemptions: 100,
        redeemedValueCents: 450_000,
        expiresAt: '2026-01-15',
        active: false,
        note: 'Depleted',
    },
    {
        id: 'cpn-4',
        code: 'FREESHIP',
        type: 'free_shipping',
        value: null,
        maxRedemptions: 200,
        redemptions: 67,
        redeemedValueCents: 53_600, // est. shipping saved (mock)
        expiresAt: null,
        active: true,
        note: 'Domestic only',
    },
];

const moneyUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function CouponsPage() {
    const [query, setQuery] = React.useState('');
    const [filter, setFilter] = React.useState('all');

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        return MOCK_COUPONS.filter((c) => {
            if (filter === 'active' && !c.active) return false;
            if (filter === 'inactive' && c.active) return false;
            if (!q) return true;
            return (
                c.code.toLowerCase().includes(q) ||
                (c.note && c.note.toLowerCase().includes(q)) ||
                c.id.toLowerCase().includes(q)
            );
        });
    }, [filter, query]);

    const activeCount = MOCK_COUPONS.filter((c) => c.active).length;
    const totalRedemptions = MOCK_COUPONS.reduce((s, c) => s + c.redemptions, 0);
    const totalRedemptionValueCents = MOCK_COUPONS.reduce((s, c) => s + (c.redeemedValueCents ?? 0), 0);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-zinc-100 text-xl font-semibold tracking-tight">Coupons</h1>
                <p className="text-zinc-500 mt-1 text-sm">
                    Promo codes for checkout — mock UI only (wire to Stripe / DB later).
                </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <CouponKpiCard
                    label="Codes (mock)"
                    value={MOCK_COUPONS.length}
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
        </div>
    );
}
