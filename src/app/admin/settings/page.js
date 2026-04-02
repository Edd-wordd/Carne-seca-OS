'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
    const [notifyOrder, setNotifyOrder] = React.useState(true);
    const [notifyLowStock, setNotifyLowStock] = React.useState(false);
    const [notifyWeekly, setNotifyWeekly] = React.useState(true);

    return (
        <div className="space-y-6">
            <div className="flex gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/80">
                    <Settings className="size-4 text-zinc-300" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-zinc-100">Settings</h1>
                    <p className="mt-1 max-w-2xl text-sm text-zinc-500">
                        Business info, tax rate, default shipping, and notification preferences. UI only — no backend
                        wiring.
                    </p>
                </div>
            </div>

            <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-zinc-100">Business info</CardTitle>
                    <CardDescription className="text-[10px] text-zinc-500">
                        Shown on invoices and customer-facing emails when wired
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-zinc-400">Legal / DBA name</Label>
                        <Input
                            defaultValue="Carne Seca Texas LLC"
                            className="h-9 border-zinc-700 bg-zinc-950 text-sm text-zinc-100"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-zinc-400">Support email</Label>
                        <Input
                            type="email"
                            defaultValue="hello@carnesecatexas.com"
                            className="h-9 border-zinc-700 bg-zinc-950 text-sm text-zinc-100"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-zinc-400">Phone</Label>
                        <Input
                            defaultValue="(915) 555-0199"
                            className="h-9 border-zinc-700 bg-zinc-950 text-sm text-zinc-100"
                        />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs text-zinc-400">Business address</Label>
                        <Input
                            defaultValue="123 Desert Wind Rd, El Paso, TX 79901"
                            className="h-9 border-zinc-700 bg-zinc-950 text-sm text-zinc-100"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-zinc-100">Tax</CardTitle>
                        <CardDescription className="text-[10px] text-zinc-500">
                            Default rate for storefront checkout (mock)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-400">Default sales tax rate (%)</Label>
                            <Input
                                defaultValue="8.25"
                                className="h-9 max-w-[140px] border-zinc-700 bg-zinc-950 text-sm text-zinc-100"
                            />
                        </div>
                        <p className="text-[10px] leading-relaxed text-zinc-600">
                            Nexus rules and category overrides will live here when connected to your tax engine.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-zinc-100">Default shipping</CardTitle>
                        <CardDescription className="text-[10px] text-zinc-500">
                            Baseline for new orders and quotes (mock)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-400">Default method</Label>
                            <Input
                                defaultValue="USPS Priority"
                                className="h-9 border-zinc-700 bg-zinc-950 text-sm text-zinc-100"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-400">Flat rate ($)</Label>
                            <Input
                                defaultValue="8.99"
                                className="h-9 max-w-[140px] border-zinc-700 bg-zinc-950 text-sm text-zinc-100"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-400">Free shipping threshold ($)</Label>
                            <Input
                                defaultValue="75.00"
                                className="h-9 max-w-[140px] border-zinc-700 bg-zinc-950 text-sm text-zinc-100"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-zinc-100">Notification preferences</CardTitle>
                    <CardDescription className="text-[10px] text-zinc-500">
                        Who gets pinged — email / SMS wiring comes later
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-4 border-b border-zinc-800/80 py-2 first:pt-0">
                        <div>
                            <p className="text-sm text-zinc-200">New order placed</p>
                            <p className="text-[10px] text-zinc-500">Notify ops when Stripe confirms payment</p>
                        </div>
                        <Switch checked={notifyOrder} onCheckedChange={setNotifyOrder} />
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-zinc-800/80 py-2">
                        <div>
                            <p className="text-sm text-zinc-200">Low stock threshold</p>
                            <p className="text-[10px] text-zinc-500">When SKU hits reorder point</p>
                        </div>
                        <Switch checked={notifyLowStock} onCheckedChange={setNotifyLowStock} />
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2">
                        <div>
                            <p className="text-sm text-zinc-200">Weekly summary</p>
                            <p className="text-[10px] text-zinc-500">Orders, revenue, top SKUs</p>
                        </div>
                        <Switch checked={notifyWeekly} onCheckedChange={setNotifyWeekly} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
