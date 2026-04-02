'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users2, UserPlus, Shield } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

const ROLES = [
    {
        id: 'owner',
        label: 'Owner',
        description: 'Full access — billing, users, all modules',
    },
    {
        id: 'manager',
        label: 'Manager',
        description: 'Orders, inventory, partners, events — no user admin',
    },
    {
        id: 'staff',
        label: 'Staff',
        description: 'Fulfillment, read-only finance, no settings',
    },
];

const MOCK_USERS = [
    {
        id: 'u-1',
        name: 'You (owner)',
        email: 'owner@carnesecatexas.com',
        role: 'owner',
        status: 'active',
        lastActive: 'Now',
        permissions: 'All modules',
    },
    {
        id: 'u-2',
        name: 'Jordan Lee',
        email: 'jordan@carnesecatexas.com',
        role: 'manager',
        status: 'active',
        lastActive: '2h ago',
        permissions: 'Orders, Ops, Events, Social',
    },
    {
        id: 'u-3',
        name: 'Sam Rivera',
        email: 'sam@carnesecatexas.com',
        role: 'staff',
        status: 'invited',
        lastActive: '—',
        permissions: 'Orders (fulfill), Inventory (adjust)',
    },
];

function roleBadgeClass(role) {
    switch (role) {
        case 'owner':
            return 'border-violet-500/40 bg-violet-500/10 text-violet-300';
        case 'manager':
            return 'border-sky-500/40 bg-sky-500/10 text-sky-300';
        case 'staff':
            return 'border-zinc-600 bg-zinc-800/80 text-zinc-400';
        default:
            return 'border-zinc-600 bg-zinc-800/80 text-zinc-400';
    }
}

export default function AdminUserManagementPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/80">
                        <Users2 className="size-4 text-indigo-400/90" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">User Management</h1>
                        <p className="mt-1 max-w-2xl text-sm text-zinc-500">
                            When you add staff they get access here. Roles and permissions are mocked — Clerk / Supabase
                            RLS wiring later. No backend.
                        </p>
                    </div>
                </div>
                <Button
                    size="sm"
                    disabled
                    className="h-9 shrink-0 gap-1.5 bg-indigo-500/20 text-indigo-300 opacity-60"
                >
                    <UserPlus className="size-3.5" />
                    Invite user
                </Button>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Seats (mock)</p>
                            <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-100">
                                {MOCK_USERS.length}
                            </p>
                        </div>
                        <Users2 className="size-4 text-indigo-400/70" />
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Active</p>
                            <p className="mt-0.5 text-lg font-semibold tabular-nums text-emerald-400">
                                {MOCK_USERS.filter((u) => u.status === 'active').length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Pending invite</p>
                            <p className="mt-0.5 text-lg font-semibold tabular-nums text-amber-400">
                                {MOCK_USERS.filter((u) => u.status === 'invited').length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-zinc-100">Role templates</CardTitle>
                    <CardDescription className="text-[10px] text-zinc-500">
                        Permission matrix will map to admin routes when implemented
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-3">
                    {ROLES.map((r) => (
                        <div
                            key={r.id}
                            className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-3"
                        >
                            <div className="flex items-center gap-2">
                                <Shield className="size-3.5 text-zinc-500" />
                                <span className="text-xs font-medium text-zinc-200">{r.label}</span>
                            </div>
                            <p className="mt-2 text-[10px] leading-relaxed text-zinc-500">{r.description}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-zinc-100">People</CardTitle>
                    <CardDescription className="text-[10px] text-zinc-500">
                        Mock directory — invite & revoke will call your auth provider
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">User</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Role</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Permissions (summary)</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Status</TableHead>
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Last active</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {MOCK_USERS.map((u) => (
                                <TableRow key={u.id} className="border-zinc-800/80">
                                    <TableCell className="px-4 py-2">
                                        <p className="text-[11px] font-medium text-zinc-200">{u.name}</p>
                                        <p className="text-[10px] text-zinc-500">{u.email}</p>
                                    </TableCell>
                                    <TableCell className="px-3 py-2">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                'border px-2 py-0.5 text-[10px] font-normal capitalize',
                                                roleBadgeClass(u.role),
                                            )}
                                        >
                                            {u.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[220px] px-3 py-2 text-[11px] leading-snug text-zinc-400">
                                        {u.permissions}
                                    </TableCell>
                                    <TableCell className="px-3 py-2">
                                        <span
                                            className={cn(
                                                'text-[10px] font-medium capitalize',
                                                u.status === 'active' && 'text-emerald-400',
                                                u.status === 'invited' && 'text-amber-400',
                                            )}
                                        >
                                            {u.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-2 text-[11px] text-zinc-500">{u.lastActive}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
