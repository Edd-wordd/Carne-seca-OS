import { escapeCsv, formatPrice } from '@/lib/utils/helpers';

function formatOrderDateTime(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function orderSourceLabel(source) {
    return source === 'pos' ? 'POS' : 'Website';
}

/**
 * Download the given orders (e.g. current filtered/sorted list) as a CSV file in the browser.
 */
export function exportOrdersToCsv(orders) {
    const headers = [
        'Order ID',
        'Customer',
        'Email',
        'Source',
        'Date',
        'Items',
        'Status',
        'Fulfillment',
        'Tracking',
        'Total',
        'Refunded',
    ];

    const rows = orders.map((o) =>
        [
            o.id,
            o.customer,
            o.email ?? '',
            orderSourceLabel(o.source ?? 'website'),
            formatOrderDateTime(o.date),
            o.items ?? 0,
            o.status,
            o.fulfillment,
            o.tracking ?? '',
            formatPrice(o.total),
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
}
