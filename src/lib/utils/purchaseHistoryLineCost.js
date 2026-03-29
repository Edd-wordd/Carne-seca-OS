/**
 * Line total for supply purchase history: prefer unit_cost × quantity (DB shape),
 * fall back to `cost` when unit cost is absent (e.g. client-only rows).
 */
export function purchaseHistoryLineCost(h) {
    const unit = parseFloat(h.unit_cost ?? h.unitCost);
    const qty = parseFloat(h.quantity);
    if (Number.isFinite(unit) && Number.isFinite(qty)) return unit * qty;
    const total = parseFloat(h.cost);
    return Number.isFinite(total) ? total : 0;
}
