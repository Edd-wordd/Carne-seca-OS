import { escapeCsv } from '@/lib/utils/helpers';

function formatLastPurchasedForCsv(d) {
    if (!d) return '—';
    const dt = new Date(d);
    const now = new Date();
    const diffDays = Math.floor((now - dt) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return dt.toLocaleDateString();
}

export function exportSuppliesToCsv(supplies, categories, paymentMethods) {
    const headers = [
        'ID',
        'Item',
        'Category',
        'Qty / Weight',
        'Purchased From',
        'Payment',
        'Purchased By',
        'Last Purchased',
        'Value',
    ];

    const rows = supplies.map((s) => {
        const cat = categories.find((c) => c.value === s.category)?.label ?? s.category ?? '';
        const qtyWeight = s.weight != null ? `${s.quantity} ${s.unit} (${s.weight} lb)` : `${s.quantity} ${s.unit}`;
        const paymentLabel =
            paymentMethods.find((p) => p.value === s.paymentMethod)?.label ?? s.paymentMethod ?? '';
        return [
            s.id ?? '',
            s.name ?? '',
            cat,
            qtyWeight,
            s.purchasedFrom ?? '',
            paymentLabel,
            s.purchasedBy ?? '',
            formatLastPurchasedForCsv(s.lastPurchasedAt),
            s.value?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '',
        ]
            .map(escapeCsv)
            .join(',');
    });

    const csv = [headers.map(escapeCsv).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supplies-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
