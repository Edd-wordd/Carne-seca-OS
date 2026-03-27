'use client';

import { AlertTriangle, Store, RotateCcw, Trash2, Layers } from 'lucide-react';

const CARD_BASE = 'flex min-w-0 flex-col gap-1.5 rounded border border-zinc-700/60 bg-zinc-900/40 px-2.5 py-2';

export function InventoryKPIs({ inventory = [], adjustmentsLog = [] }) {
    const totalValue = inventory.reduce((s, p) => s + p.value, 0);
    const totalBags = inventory
        .filter((p) => p.category === 'carne_seca')
        .reduce((s, p) => s + p.stock, 0);
    const totalCostToMake = inventory.reduce((s, p) => {
        const costPerBag = p.costPerBag ?? 0;
        return s + p.stock * costPerBag;
    }, 0);
    const totalConsignment = inventory.reduce((s, p) => s + (p.consignment ?? 0), 0);
    const consignmentValue = inventory.reduce((s, p) => {
        const unitValue = p.stock > 0 ? p.value / p.stock : 0;
        return s + Math.round((p.consignment ?? 0) * unitValue);
    }, 0);
    const lowStockCount = inventory.filter((p) => p.stock > 0 && p.stock <= p.lowThreshold).length;
    const outOfStockCount = inventory.filter((p) => p.stock === 0).length;

    const spoilageTotal = adjustmentsLog
        .filter((r) => r.reason === 'spoiled')
        .reduce((s, r) => s + (Number(r.total_loss_cost) ?? 0), 0);
    const otherLossTotal = adjustmentsLog
        .filter((r) => r.reason !== 'spoiled')
        .reduce((s, r) => s + (Number(r.total_loss_cost) ?? 0), 0);
    const totalLosses = spoilageTotal + otherLossTotal;

    return (
        <div className="space-y-2">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Overview</span>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {/* Inventory: bags, value, cost */}
                <div className={CARD_BASE}>
                    <div className="flex items-center gap-2">
                        <Layers className="size-3.5 shrink-0 text-indigo-400/80" />
                        <span className="text-zinc-500 text-[10px]">Inventory</span>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-zinc-100 text-xs font-semibold tabular-nums">
                            {totalBags.toLocaleString()} bags · ${totalValue.toLocaleString()} value
                        </p>
                        <p className="text-amber-400/90 text-[10px] tabular-nums">
                            Cost: ${totalCostToMake.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* Consignment */}
                <div className={CARD_BASE}>
                    <div className="flex items-center gap-2">
                        <Store className="size-3.5 shrink-0 text-violet-400/80" />
                        <span className="text-zinc-500 text-[10px]">Consignment</span>
                    </div>
                    <p className="text-zinc-100 text-xs font-semibold tabular-nums">
                        {totalConsignment} units · ${consignmentValue.toLocaleString()} value
                    </p>
                </div>

                {/* Stock Alerts: low + out */}
                <div className={CARD_BASE}>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="size-3.5 shrink-0 text-amber-400/80" />
                        <span className="text-zinc-500 text-[10px]">Stock Alerts</span>
                    </div>
                    <p className="text-zinc-100 text-xs font-semibold tabular-nums">
                        {lowStockCount} low · {outOfStockCount} out
                    </p>
                </div>

                {/* Losses: spoilage + returns/damage */}
                <div className={CARD_BASE}>
                    <div className="flex items-center gap-2">
                        <Trash2 className="size-3.5 shrink-0 text-red-400/80" />
                        <RotateCcw className="size-3.5 shrink-0 text-orange-400/80" />
                        <span className="text-zinc-500 text-[10px]">Losses</span>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-xs tabular-nums">
                            <span className="text-red-400/90">Spoilage ${spoilageTotal.toLocaleString()}</span>
                            {' · '}
                            <span className="text-orange-400/90">Other Losses ${otherLossTotal.toLocaleString()}</span>
                        </p>
                        <p className="text-zinc-500 text-[10px] tabular-nums">
                            Total lost: ${totalLosses.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
