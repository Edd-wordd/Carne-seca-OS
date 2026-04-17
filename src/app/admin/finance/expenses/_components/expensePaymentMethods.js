/** Allowed values for reconciliation (cash / card / check). */
export const PAYMENT_METHOD_OPTIONS = ['Cash', 'Card', 'Check'];

export function normalizePaymentMethod(value) {
    const s = String(value ?? '').trim();
    if (s === 'ACH') return 'Check';
    if (PAYMENT_METHOD_OPTIONS.includes(s)) return s;
    return 'Card';
}
