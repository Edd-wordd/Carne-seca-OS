function formatLocalDate(isoOrDate) {
    if (!isoOrDate) return '';
    return String(isoOrDate).slice(0, 10);
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

/** Display labels for `public.expenses.payment_method` CHECK values; order matches admin dropdown. */
export const EXPENSE_PAYMENT_METHOD_UI_OPTIONS = Object.freeze([
    'Cash',
    'Check',
    'Credit card',
    'Debit card',
    'Venmo',
    'Zelle',
    'Wire',
    'Other',
]);

const PAYMENT_METHOD_DB_TO_LABEL = {
    cash: 'Cash',
    check: 'Check',
    credit_card: 'Credit card',
    debit_card: 'Debit card',
    venmo: 'Venmo',
    zelle: 'Zelle',
    wire: 'Wire',
    other: 'Other',
};

/** Admin UI category label (see `CATEGORY_STYLES`) -> `expenses.category` CHECK value. */
const CATEGORY_LABEL_TO_DB = {
    Packaging: 'packaging',
    'Raw Materials': 'raw_materials',
    Seasoning: 'seasoning',
    Logistics: 'logistics',
    Software: 'software',
    Other: 'other',
};

export function categoryLabelToDb(label) {
    const s = String(label ?? '').trim();
    return CATEGORY_LABEL_TO_DB[s] ?? 'other';
}

export function paymentMethodLabelToDb(label) {
    const s = String(label ?? '').trim();
    const entry = Object.entries(PAYMENT_METHOD_DB_TO_LABEL).find(([, v]) => v === s);
    return entry ? entry[0] : 'other';
}

/** Map DB `payment_method` to the label string used in the admin expenses UI (1:1, no collapsing). */
function paymentMethodUiFromDb(db) {
    const s = String(db ?? '').toLowerCase();
    return PAYMENT_METHOD_DB_TO_LABEL[s] ?? 'Other';
}

/**
 * Map a row from `public.expenses` to the shape used by `ExpensesClient`.
 */
export function normalizeExpenseFromDb(row) {
    if (!row?.id) return null;
    const noteTrimmed = row.note == null ? '' : String(row.note).trim();
    return {
        id: String(row.id),
        expenseNumber: row.expense_number ?? '',
        date: formatLocalDate(row.purchased_at),
        vendor: row.vendor ?? '',
        vendorId: row.vendor_id != null ? String(row.vendor_id) : null,
        category: categoryLabel(row.category),
        note: noteTrimmed || null,
        amountCents: Number(row.amount_cents) || 0,
        paymentMethod: paymentMethodUiFromDb(row.payment_method),
    };
}
