import { formatCurrency, escapeCsv, getStatusConfig } from '@/lib/utils';

export function exportBatchesToCsv(filteredBatches) {
    const headers = [
        'Batch ID',
        'Supplier',
        'Raw Weight (lbs)',
        'Cost / lb',
        'Yield %',
        'Bags',
        'Status',
        'Timeline',
        'Total Cost',
    ];

    const rows = filteredBatches.map((batch) => {
        const totalBags = batch.finished_bags?.reduce((sum, fb) => sum + (fb.stock_quantity || 0), 0) || 0;
        const createdDate = batch.created_at
            ? new Date(batch.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '';
        const processedDate =
            batch.tracking_status === 'finished' && batch.last_updated
                ? new Date(batch.last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : '';
        const timeline = processedDate ? `${createdDate} → ${processedDate}` : createdDate;
        return [
            batch.batch_number ?? batch.id,
            batch.suppliers?.name ?? '',
            (batch.raw_weight ?? 0).toFixed(1),
            formatCurrency(batch.cost_per_pound),
            batch.yield_percent != null ? `${Math.round(batch.yield_percent * 100)}%` : '—',
            totalBags,
            batch.tracking_status ? getStatusConfig(batch.tracking_status).label : '—',
            timeline,
            `$${((batch.initial_weight ?? batch.raw_weight) * (batch.cost_per_pound ?? 0)).toFixed(2)}`,
        ]
            .map(escapeCsv)
            .join(',');
    });

    const csv = [headers.map(escapeCsv).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `production-batches-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
