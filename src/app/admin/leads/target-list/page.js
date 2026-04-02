'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { MapPinned, Search, Building2, Store, Truck, Briefcase, ShoppingBasket } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

const TARGET_TYPES = [
    { value: 'restaurant', label: 'Restaurant', icon: Store },
    { value: 'food_truck', label: 'Food truck', icon: Truck },
    { value: 'specialty_grocer', label: 'Specialty grocer', icon: ShoppingBasket },
    { value: 'corporate', label: 'Corporate office', icon: Briefcase },
];

const MOCK_TARGETS = [
    {
        id: 't-1',
        name: 'Mesa Street Kitchen',
        type: 'restaurant',
        area: 'West El Paso / Mesa Hills',
        notes: 'Chef-driven menu — ask for GM, wholesale tasting kit',
        priority: 'high',
    },
    {
        id: 't-2',
        name: 'Chuco Tacos Mobile',
        type: 'food_truck',
        area: 'Downtown / San Jacinto Plaza events',
        notes: 'Often at First Fridays — bring samples, not pitch deck',
        priority: 'medium',
    },
    {
        id: 't-3',
        name: 'Sun City Provisions',
        type: 'specialty_grocer',
        area: 'Kern Place',
        notes: 'Local dry goods + charcuterie wall — fit for 4oz impulse',
        priority: 'high',
    },
    {
        id: 't-4',
        name: 'Franklin High Desert Farms Market',
        type: 'specialty_grocer',
        area: 'Upper Valley',
        notes: 'Weekend market anchor — contact buyer via IG',
        priority: 'medium',
    },
    {
        id: 't-5',
        name: 'WestStar Tower — campus café RFP',
        type: 'corporate',
        area: 'Downtown',
        notes: 'Facilities runs snack program — need intro through tenant services',
        priority: 'low',
    },
    {
        id: 't-6',
        name: 'The Junction Smoke & Grill',
        type: 'restaurant',
        area: 'Five Points / Gateway',
        notes: 'BBQ adjacency — owner active on Facebook groups',
        priority: 'high',
    },
    {
        id: 't-7',
        name: 'Desert Smoke BBQ Co. (truck)',
        type: 'food_truck',
        area: 'Eastside / Socorro corridor',
        notes: 'Catering-heavy — partnership on event packs',
        priority: 'medium',
    },
    {
        id: 't-8',
        name: 'Coronado Corporate Center — micro-market vendor',
        type: 'corporate',
        area: 'Westside business park',
        notes: 'Third-party operator runs market — find contract holder',
        priority: 'low',
    },
];

function typeLabel(value) {
    return TARGET_TYPES.find((t) => t.value === value)?.label ?? value;
}

function typeIcon(value) {
    return TARGET_TYPES.find((t) => t.value === value)?.icon ?? Building2;
}

function priorityClass(p) {
    switch (p) {
        case 'high':
            return 'border-rose-600/40 bg-rose-500/10 text-rose-300';
        case 'medium':
            return 'border-amber-600/40 bg-amber-500/10 text-amber-300';
        case 'low':
            return 'border-zinc-600/50 bg-zinc-800/50 text-zinc-400';
        default:
            return 'border-zinc-600/50 bg-zinc-800/50 text-zinc-400';
    }
}

export default function LeadsTargetListPage() {
    const [search, setSearch] = React.useState('');

    const counts = React.useMemo(() => {
        const c = { restaurant: 0, food_truck: 0, specialty_grocer: 0, corporate: 0 };
        MOCK_TARGETS.forEach((t) => {
            if (c[t.type] !== undefined) c[t.type] += 1;
        });
        return c;
    }, []);

    const rows = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return MOCK_TARGETS;
        return MOCK_TARGETS.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                r.area.toLowerCase().includes(q) ||
                typeLabel(r.type).toLowerCase().includes(q) ||
                r.notes.toLowerCase().includes(q),
        );
    }, [search]);

    return (
        <div className="space-y-4">
            <div className="flex gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/80">
                    <MapPinned className="size-4 text-orange-400/90" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-zinc-100">Target List</h1>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-500">
                        Your hit list of specific restaurants, food trucks, specialty grocers, and corporate offices in{' '}
                        <span className="text-zinc-400">El Paso</span> you want to get into. UI only — no backend.
                    </p>
                </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                <Card className="border-zinc-800 bg-zinc-900/70 sm:col-span-2 lg:col-span-1">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Total targets</p>
                            <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-100">
                                {MOCK_TARGETS.length}
                            </p>
                        </div>
                        <MapPinned className="size-4 text-orange-400/70" />
                    </CardContent>
                </Card>
                {TARGET_TYPES.map(({ value, label, icon: Icon }) => (
                    <Card key={value} className="border-zinc-800 bg-zinc-900/70">
                        <CardContent className="flex items-start justify-between p-3">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
                                <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-100">
                                    {counts[value] ?? 0}
                                </p>
                            </div>
                            <Icon className="size-4 text-zinc-500" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader className="space-y-0 pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-sm text-zinc-100">El Paso targets</CardTitle>
                            <CardDescription className="text-[10px] text-zinc-500">
                                Mock accounts — replace with saved list / CRM later
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
                            <Input
                                placeholder="Search name, area, type, notes…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-8 border-zinc-700 bg-zinc-950 pl-8 text-xs text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Account</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Type</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Area</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Priority</TableHead>
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow className="border-zinc-800/80">
                                    <TableCell colSpan={5} className="py-10 text-center text-sm text-zinc-500">
                                        No targets match your search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row) => {
                                    const Icon = typeIcon(row.type);
                                    return (
                                        <TableRow key={row.id} className="border-zinc-800/80">
                                            <TableCell className="px-4 py-2">
                                                <p className="text-[11px] font-medium text-zinc-200">{row.name}</p>
                                                <p className="font-mono text-[10px] text-zinc-600">{row.id}</p>
                                            </TableCell>
                                            <TableCell className="px-3 py-2">
                                                <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-300">
                                                    <Icon className="size-3.5 shrink-0 text-zinc-500" />
                                                    {typeLabel(row.type)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="max-w-[180px] px-3 py-2 text-[11px] text-zinc-400">
                                                {row.area}
                                            </TableCell>
                                            <TableCell className="px-3 py-2">
                                                <span
                                                    className={cn(
                                                        'inline-flex rounded border px-2 py-0.5 text-[10px] font-medium capitalize',
                                                        priorityClass(row.priority),
                                                    )}
                                                >
                                                    {row.priority}
                                                </span>
                                            </TableCell>
                                            <TableCell className="max-w-[320px] px-4 py-2 text-[11px] leading-snug text-zinc-500">
                                                {row.notes}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
