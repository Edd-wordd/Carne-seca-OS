import { escapeCsv } from '@/lib/utils/helpers';

function discountLabel(c) {
    if (c.type === 'percent') return `${c.value}% off`;
    if (c.type === 'fixed')
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
            (c.valueCents ?? 0) / 100,
        );
    if (c.type === 'free_shipping') return 'Free shipping';
    return '—';
}

export function exportCouponsToCsv(coupons) {
    const headers = [
        'ID',
        'Code',
        'Type',
        'Discount',
        'Redemptions',
        'Max redemptions',
        'Redeemed value (USD)',
        'Expires',
        'Status',
        'Note',
    ];

    const rows = coupons.map((c) => {
        const redeemedUsd = ((c.redeemedValueCents ?? 0) / 100).toFixed(2);
        const maxRedemptions =
            c.maxRedemptions != null ? String(c.maxRedemptions) : '';
        return [
            c.id ?? '',
            c.code ?? '',
            c.type ?? '',
            discountLabel(c),
            String(c.redemptions ?? 0),
            maxRedemptions,
            redeemedUsd,
            c.expiresAt ?? '',
            c.active ? 'Active' : 'Inactive',
            c.note ?? '',
        ]
            .map(escapeCsv)
            .join(',');
    });

    const csv = [headers.map(escapeCsv).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coupons-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
