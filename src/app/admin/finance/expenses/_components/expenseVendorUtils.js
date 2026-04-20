/** Sentinel value for "one-off vendor" in supplier `<select>`. */
export const VENDOR_ONE_OFF = '__one_off__';

export function normalizeSuppliersList(raw) {
    const list = Array.isArray(raw) ? raw : [];
    return list
        .map((s) => ({
            supplier_id: String(s.supplier_id ?? s.id ?? ''),
            name: String(s.name ?? '').trim(),
        }))
        .filter((s) => s.supplier_id && s.name)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}
