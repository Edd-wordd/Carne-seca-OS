import { escapeCsv, formatPrice } from '@/lib/utils/helpers';

/**
 * Download the given expenses (e.g. current filtered list) as a CSV file in the browser.
 * @param {Array<{ id?: string, vendor?: string, vendorId?: string | null, category?: string, note?: string, date?: string, paymentMethod?: string, amountCents?: number }>} expenses
 * @param {(value: unknown) => string} [formatPaymentMethod] Same normalization as the UI (payment method labels).
 */
export function exportExpensesToCsv(expenses, formatPaymentMethod = (v) => String(v ?? '')) {
    const headers = ['ID', 'Vendor', 'Vendor ID', 'Category', 'Note', 'Date', 'Payment method', 'Amount'];

    const rows = expenses.map((x) =>
        [
            x.id ?? '',
            x.vendor ?? '',
            x.vendorId != null && x.vendorId !== '' ? String(x.vendorId) : '',
            x.category ?? '',
            x.note ?? '',
            x.date ?? '',
            formatPaymentMethod(x.paymentMethod),
            formatPrice(x.amountCents ?? 0),
        ]
            .map(escapeCsv)
            .join(','),
    );

    const csv = [headers.map(escapeCsv).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
