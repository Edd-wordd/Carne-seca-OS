import { escapeCsv } from '@/lib/utils/helpers';

function discountLabel(c) {
    const d = c.discount;
    if (!d) return '—';
    if (d.type === 'percent') return `${d.value}% off`;
    if (d.type === 'fixed') {
        const currency = d.currency ?? 'USD';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format((d.value ?? 0) / 100);
    }
    return '—';
}

function couponNote(c) {
    if (c.metadata?.note) return c.metadata.note;
    const values = Object.values(c.metadata ?? {}).filter((v) => v != null && String(v).trim() !== '');
    return values.length ? values.join(' · ') : '';
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
        const maxRedemptions = c.uses?.max != null ? String(c.uses.max) : '';
        const expires = c.expires ? c.expires.slice(0, 10) : '';
        return [
            c.id ?? '',
            c.code ?? '',
            c.discount?.type ?? '',
            discountLabel(c),
            String(c.uses?.redeemed ?? 0),
            maxRedemptions,
            '0.00',
            expires,
            c.status === 'active' ? 'Active' : 'Inactive',
            couponNote(c),
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
