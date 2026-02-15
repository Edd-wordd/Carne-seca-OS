'use client';

import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

// Hardcoded order details - connect API later
const MOCK_ORDER = {
    stripe_session_id: null, // will use session_id from URL when connected
    customer_email: 'customer@example.com',
    amount_total: 4299,
    order_items: [
        { product: { name: 'Carne Seca Original' }, quantity: 2, unit_price_cents: 1499 },
        { product: { name: 'Machaca Blend' }, quantity: 1, unit_price_cents: 1299 },
    ],
};

export default function SuccessPage() {
    const order = MOCK_ORDER;

    return (
        <div className="min-h-[60vh] px-4 py-16 sm:py-24">
            <div className="mx-auto max-w-xl">
                {/* Hero */}
                <div className="text-center mb-14">
                    <div
                        className="inline-flex items-center justify-center size-16 rounded-full mb-6"
                        style={{
                            background: 'oklch(0.97 0.02 25)',
                            boxShadow: '0 0 0 1px oklch(0.85 0.04 25 / 40%)',
                        }}
                    >
                        <CheckCircle2 className="size-8" style={{ color: 'oklch(0.45 0.12 25)' }} strokeWidth={2} />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                        Order confirmed
                    </h1>
                    <p className="mt-3 text-muted-foreground text-[15px] max-w-sm mx-auto leading-relaxed">
                        Thank you for your purchase. We&apos;ve received your payment and are preparing your order.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Order summary */}
                    <Card className="overflow-hidden border-border/80">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <Package className="size-4 text-muted-foreground" strokeWidth={1.5} />
                                <CardTitle className="text-base font-medium">Order summary</CardTitle>
                            </div>
                            <p className="text-muted-foreground text-xs font-mono mt-1">asfasdfkjfwiuehf</p>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            <ul className="space-y-3">
                                {order.order_items.map((item, idx) => (
                                    <li
                                        key={idx}
                                        className="flex justify-between items-start gap-4 py-2 border-b border-border/50 last:border-0"
                                    >
                                        <span className="text-sm">
                                            {item.product?.name ?? 'Item'} × {item.quantity}
                                        </span>
                                        <span className="text-sm font-medium tabular-nums shrink-0">
                                            {formatPrice((item.unit_price_cents ?? 0) * item.quantity)}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex justify-between items-center pt-2 border-t">
                                <span className="text-sm font-medium">Total</span>
                                <span className="font-semibold tabular-nums">
                                    {formatPrice(order.amount_total ?? 0)}
                                </span>
                            </div>

                            <p className="text-muted-foreground text-xs pt-1">
                                Confirmation sent to <span className="text-foreground">{order.customer_email}</span>
                            </p>
                        </CardContent>
                    </Card>

                    {/* What's next */}
                    <Card className="bg-muted/40 border-muted">
                        <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground mb-4">
                                We&apos;ll notify you when your order ships. In the meantime, explore more of our
                                selection.
                            </p>
                            <Button asChild variant="outline" size="default" className="group">
                                <Link href="/products">
                                    Continue shopping
                                    <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
