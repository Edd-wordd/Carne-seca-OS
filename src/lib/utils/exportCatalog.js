import { escapeCsv } from '@/lib/utils/helpers';

function formatCurrency(n) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(n ?? 0);
}

function formatDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    return isNaN(dt.getTime())
        ? d
        : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function exportCatalogToCsv(items) {
    const headers = [
        'Flavor',
        'SKU',
        'Cost/Bag',
        'Sell Price',
        'Launch date',
        'Status',
    ];

    const rows = items.map((p) => {
        const sellPrice = p.price_cents != null ? p.price_cents / 100 : null;
        return [
            p.name ?? p.flavor ?? '',
            p.sku ?? '',
            p.cost_per_bag != null ? formatCurrency(p.cost_per_bag) : '',
            sellPrice != null ? formatCurrency(sellPrice) : '',
            formatDate(p.launch_date ?? p.launchDate),
            p.status === 'active' ? 'Active' : 'Hidden',
        ]
            .map(escapeCsv)
            .join(',');
    });

    const csv = [headers.map(escapeCsv).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalog-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
