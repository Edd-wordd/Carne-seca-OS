"use client";

import * as React from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
} from "react-simple-maps";
import { cn } from "@/lib/utils";

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// Mock: orders by state
const ORDERS_BY_STATE = {
    Texas: 142,
    California: 89,
    Florida: 67,
    "New York": 54,
    Arizona: 42,
    Colorado: 38,
    "New Mexico": 31,
    Nevada: 28,
    Georgia: 24,
    Illinois: 19,
    Washington: 15,
};

// Mock: map-level insights
const MAP_INSIGHTS = {
    topSelling: { state: "Texas", value: "142 orders" },
    fastestGrowth: { state: "Arizona", value: "+34%" },
    mostItems: { state: "California", value: "412 units" },
    largestDecline: { state: "Illinois", value: "−18%" },
};

const getOrdersForState = (name) => ORDERS_BY_STATE[name] ?? 0;

const maxOrders = Math.max(...Object.values(ORDERS_BY_STATE));

function getFillColor(count) {
    if (count === 0) return "#27272a"; // zinc-800
    const intensity = count / maxOrders;
    if (intensity > 0.7) return "#6366f1"; // indigo-500
    if (intensity > 0.4) return "#4f46e5"; // indigo-600
    if (intensity > 0.2) return "#4338ca"; // indigo-700
    return "#3730a3"; // indigo-800
}

export default function OrdersMap() {
    const [tooltip, setTooltip] = React.useState(null);

    return (
        <div className="relative aspect-[1.6] w-full overflow-hidden rounded border border-zinc-800 bg-zinc-900/50">
            {tooltip && (
                <div className="absolute right-3 top-3 z-10 rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 shadow-lg">
                    <p className="text-zinc-200 text-xs font-medium">{tooltip.name}</p>
                    <p className="text-indigo-400 text-[11px] tabular-nums">{tooltip.orders} orders</p>
                </div>
            )}
            <ComposableMap
                projection="geoAlbersUsa"
                projectionConfig={{ scale: 800 }}
                style={{ width: "100%", height: "100%" }}
            >
                <ZoomableGroup center={[-97, 39]} zoom={1}>
                    <Geographies geography={GEO_URL}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const name = geo.properties?.name ?? "";
                                const orders = getOrdersForState(name);
                                const fill = getFillColor(orders);
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={fill}
                                        stroke="#3f3f46"
                                        strokeWidth={0.5}
                                        onMouseEnter={() => setTooltip({ name, orders })}
                                        onMouseLeave={() => setTooltip(null)}
                                        style={{
                                            default: { outline: "none" },
                                            hover: { outline: "none", fill: "#818cf8", cursor: "pointer" },
                                            pressed: { outline: "none" },
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>
            <div className="absolute bottom-3 left-3 right-3 flex flex-nowrap items-stretch justify-between gap-2">
                <div className="flex h-[52px] w-28 flex-col justify-center rounded border border-indigo-500/50 bg-zinc-900/95 px-2 py-1.5">
                    <p className="text-zinc-400 text-[10px]">Orders by state</p>
                    <div className="mt-1 flex gap-2">
                        {["Low", "High"].map((_, i) => (
                            <div key={i} className="flex items-center gap-1">
                                <div
                                    className={cn(
                                        "size-2 rounded-sm",
                                        i === 0 ? "bg-indigo-800/80" : "bg-indigo-500"
                                    )}
                                />
                                <span className="text-zinc-500 text-[9px]">{i === 0 ? "Low" : "High"}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {[
                    { label: "Top", state: MAP_INSIGHTS.topSelling.state, value: MAP_INSIGHTS.topSelling.value, accent: "zinc", border: "border-indigo-500/50" },
                    { label: "Growth", state: MAP_INSIGHTS.fastestGrowth.state, value: MAP_INSIGHTS.fastestGrowth.value, accent: "emerald", border: "border-emerald-500/50" },
                    { label: "Units", state: MAP_INSIGHTS.mostItems.state, value: MAP_INSIGHTS.mostItems.value, accent: "zinc", border: "border-cyan-500/50" },
                    { label: "Decline", state: MAP_INSIGHTS.largestDecline.state, value: MAP_INSIGHTS.largestDecline.value, accent: "amber", border: "border-amber-500/50" },
                ].map(({ label, state, value, accent, border }) => (
                    <div key={label} className={cn("flex h-[52px] w-28 flex-col justify-center rounded border bg-zinc-900/95 px-2 py-1.5", border)}>
                        <p className="text-zinc-500 text-[9px]">
                            <span className={cn("font-medium", accent === "emerald" && "text-emerald-500", accent === "amber" && "text-amber-500", accent === "zinc" && "text-zinc-400")}>{label}:</span> {state} ({value})
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
