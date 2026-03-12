import { escapeCsv } from '@/lib/utils/helpers';

export function exportInventoryToCsv(inventory) {
    const headers = [
        'SKU',
        'Product',
        'Available',
        'Consignment',
        'Cost/Bag',
        'Sell Price',
        'Low Threshold',
        'Status',
        'Value',
    ];

    const rows = inventory.map((p) => {
        const isOut = p.stock === 0;
        const isLow = !isOut && p.stock <= p.lowThreshold;
        const status = isOut ? 'Out of stock' : isLow ? 'Low stock' : 'OK';
        return [
            p.sku,
            p.name,
            p.stock,
            p.consignment ?? 0,
            p.costPerBag != null ? `$${p.costPerBag.toFixed(2)}` : '',
            p.sellPrice != null ? `$${p.sellPrice.toFixed(2)}` : '',
            p.lowThreshold,
            status,
            `$${p.value.toLocaleString()}`,
        ]
            .map(escapeCsv)
            .join(',');
    });

    const csv = [headers.map(escapeCsv).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
