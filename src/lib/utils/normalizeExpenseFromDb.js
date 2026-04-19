function formatLocalDate(isoOrDate) {
    if (!isoOrDate) return '';
    const d = new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

const CATEGORY_DB_TO_LABEL = {
    packaging: 'Packaging',
    raw_materials: 'Raw Materials',
    seasoning: 'Seasoning',
    logistics: 'Logistics',
    other: 'Other',
    software: 'Software',
};

function categoryLabel(slug) {
    const s = String(slug ?? '').toLowerCase();
    return CATEGORY_DB_TO_LABEL[s] ?? 'Other';
}

/** Map DB payment_method to the short labels used in the admin expenses UI. */
function paymentMethodUiFromDb(db) {
    const s = String(db ?? '').toLowerCase();
    if (s === 'cash') return 'Cash';
    if (s === 'check') return 'Check';
    if (s === 'credit_card' || s === 'debit_card' || s === 'venmo' || s === 'zelle' || s === 'other') return 'Card';
    if (s === 'wire') return 'Check';
    return 'Card';
}

/**
 * Map a row from `public.expenses` to the shape used by `ExpensesClient`.
 */
export function normalizeExpenseFromDb(row) {
    if (!row?.id) return null;
    return {
        id: String(row.id),
        date: formatLocalDate(row.purchased_at),
        vendor: row.vendor ?? '',
        vendorId: row.vendor_id != null ? String(row.vendor_id) : null,
        category: categoryLabel(row.category),
        note: row.note?.trim() ? row.note : '—',
        amountCents: Number(row.amount_cents) || 0,
        paymentMethod: paymentMethodUiFromDb(row.payment_method),
    };
}
