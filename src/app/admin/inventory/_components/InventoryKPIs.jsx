'use client';

import {
    Box,
    Package,
    AlertTriangle,
    Store,
    RotateCcw,
    Trash2,
    Layers,
    DollarSign,
} from 'lucide-react';

export function InventoryKPIs({ inventory = [], losses = [] }) {
    const totalValue = inventory.reduce((s, p) => s + p.value, 0);
    const totalBags = inventory.reduce((s, p) => s + p.stock, 0);
    const totalCostToMake = inventory.reduce((s, p) => {
        const costPerBag = p.costPerBag ?? (p.stock > 0 ? p.value / p.stock : 0);
        return s + p.stock * costPerBag;
    }, 0);
    const totalConsignment = inventory.reduce((s, p) => s + (p.consignment ?? 0), 0);
    const consignmentValue = inventory.reduce((s, p) => {
        const unitValue = p.stock > 0 ? p.value / p.stock : 0;
        return s + Math.round((p.consignment ?? 0) * unitValue);
    }, 0);
    const lowStockCount = inventory.filter((p) => p.stock > 0 && p.stock <= p.lowThreshold).length;
    const outOfStockCount = inventory.filter((p) => p.stock === 0).length;

    const spoilageTotal = losses.filter((l) => l.type === 'spoilage').reduce((s, l) => s + l.value, 0);
    const returnsTotal = losses.filter((l) => l.type === 'return').reduce((s, l) => s + l.value, 0);
    const damageTotal = losses.filter((l) => l.type === 'damage').reduce((s, l) => s + l.value, 0);
    const otherLossTotal = losses
        .filter((l) => !['spoilage', 'return', 'damage'].includes(l.type))
        .reduce((s, l) => s + l.value, 0);
    const totalLosses = spoilageTotal + returnsTotal + damageTotal + otherLossTotal;

    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                <Layers className="size-4 shrink-0 text-indigo-400/80" />
                <div className="min-w-0 flex-1">
                    <p className="text-zinc-400 text-[10px]">Total Bags</p>
                    <p className="text-zinc-100 text-sm font-semibold tabular-nums">{totalBags.toLocaleString()}</p>
                    <p className="text-zinc-500 text-[9px]">available</p>
                </div>
            </div>
            <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                <DollarSign className="size-4 shrink-0 text-amber-400/80" />
                <div className="min-w-0 flex-1">
                    <p className="text-zinc-400 text-[10px]">Total Cost to Make</p>
                    <p className="text-amber-400 text-sm font-semibold tabular-nums">
                        ${totalCostToMake.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>
            <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                <Box className="size-4 shrink-0 text-indigo-400/80" />
                <div className="min-w-0 flex-1">
                    <p className="text-zinc-400 text-[10px]">Total Value</p>
                    <p className="text-zinc-100 text-sm font-semibold tabular-nums">
                        ${totalValue.toLocaleString()}
                    </p>
                </div>
            </div>
            <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                <Store className="size-4 shrink-0 text-violet-400/80" />
                <div className="min-w-0 flex-1">
                    <p className="text-zinc-400 text-[10px]">On Consignment</p>
                    <p className="text-zinc-100 text-sm font-semibold tabular-nums">{totalConsignment} units</p>
                    <p className="text-zinc-500 text-[9px]">${consignmentValue.toLocaleString()} value</p>
                </div>
            </div>
            <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                <AlertTriangle className="size-4 shrink-0 text-amber-400/80" />
                <div className="min-w-0 flex-1">
                    <p className="text-zinc-400 text-[10px]">Low Stock</p>
                    <p className="text-zinc-100 text-sm font-semibold tabular-nums">{lowStockCount}</p>
                </div>
            </div>
            <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                <Package className="size-4 shrink-0 text-zinc-500" />
                <div className="min-w-0 flex-1">
                    <p className="text-zinc-400 text-[10px]">Out of Stock</p>
                    <p className="text-zinc-100 text-sm font-semibold tabular-nums">{outOfStockCount}</p>
                </div>
            </div>
            <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                <Trash2 className="size-4 shrink-0 text-red-400/80" />
                <div className="min-w-0 flex-1">
                    <p className="text-zinc-400 text-[10px]">Spoilage</p>
                    <p className="text-red-400 text-sm font-semibold tabular-nums">
                        ${spoilageTotal.toLocaleString()}
                    </p>
                </div>
            </div>
            <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                <RotateCcw className="size-4 shrink-0 text-orange-400/80" />
                <div className="min-w-0 flex-1">
                    <p className="text-zinc-400 text-[10px]">Returns & Damage</p>
                    <p className="text-orange-400 text-sm font-semibold tabular-nums">
                        ${(returnsTotal + damageTotal + otherLossTotal).toLocaleString()}
                    </p>
                    <p className="text-zinc-500 text-[9px]">Total lost: ${totalLosses.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}
