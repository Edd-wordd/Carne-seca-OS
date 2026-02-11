'use client';

import { useState, useRef, useCallback, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

const DEBOUNCE_MS = 400;

export default function CartPageContent({ initialItems = [], onDeleteItem, onUpdateQuantity }) {
    const [items, setItems] = useState(initialItems);
    const [deletingId, setDeletingId] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [isPending, startTransition] = useTransition();
    const debounceTimers = useRef({});
    const itemsRef = useRef(items);

    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    useEffect(() => {
        itemsRef.current = items;
    }, [items]);

    const handleRemove = (cartItemId) => {
        if (debounceTimers.current[cartItemId]) {
            clearTimeout(debounceTimers.current[cartItemId]);
            delete debounceTimers.current[cartItemId];
        }
        setItems((prev) => prev.filter((item) => item.id !== cartItemId));
        setDeletingId(cartItemId);
        startTransition(async () => {
            await onDeleteItem(cartItemId);
            setDeletingId(null);
        });
    };

    const flushQuantityUpdate = useCallback(
        (cartItemId) => {
            delete debounceTimers.current[cartItemId];
            const item = itemsRef.current.find((i) => i.id === cartItemId);
            if (!item) return;
            const qty = item.quantity ?? 1;
            setUpdatingId(cartItemId);
            startTransition(async () => {
                await onUpdateQuantity(cartItemId, qty);
                setUpdatingId(null);
            });
        },
        [onUpdateQuantity, startTransition],
    );

    const handleQuantityChange = (cartItemId, currentQuantity, delta) => {
        const newQuantity = currentQuantity + delta;
        if (newQuantity <= 0) {
            handleRemove(cartItemId);
            return;
        }
        setItems((prev) =>
            prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item)),
        );
        if (debounceTimers.current[cartItemId]) clearTimeout(debounceTimers.current[cartItemId]);
        debounceTimers.current[cartItemId] = setTimeout(() => flushQuantityUpdate(cartItemId), DEBOUNCE_MS);
    };

    const subtotal = items.reduce(
        (acc, item) => acc + (item.quantity ?? 1) * (item.product?.price_cents ?? 0),
        0,
    );

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <p className="text-muted-foreground mb-6">Your cart is empty.</p>
                <Button asChild variant="outline">
                    <Link href="/products">Continue shopping</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-6">
                {items.map((item) => {
                    const qty = item.quantity ?? 1;
                    const isDeleting = deletingId === item.id;
                    const isUpdating = updatingId === item.id;
                    const isBusy = isDeleting || isUpdating;

                    return (
                        <div
                            key={item.id}
                            className="flex gap-6 border-b border-border pb-6 last:border-0 last:pb-0"
                        >
                            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                                {item.product?.image_url ? (
                                    <Image
                                        src={item.product.image_url}
                                        alt={item.product?.name ?? 'Product'}
                                        fill
                                        className="object-cover"
                                        sizes="96px"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
                                        —
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-medium">{item.product?.name ?? 'Product'}</p>
                                <p className="text-muted-foreground mt-0.5 text-sm">
                                    {formatPrice(item.product?.price_cents ?? 0)} each
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleQuantityChange(item.id, qty, -1)}
                                        disabled={isBusy}
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus className="h-3.5 w-3.5" />
                                    </Button>
                                    <span className="min-w-[2rem] text-center text-sm tabular-nums">
                                        {isUpdating ? (
                                            <Loader2 className="inline-block h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            qty
                                        )}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleQuantityChange(item.id, qty, 1)}
                                        disabled={isBusy}
                                        aria-label="Increase quantity"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex flex-col items-end justify-between">
                                <p className="font-medium">{formatPrice(qty * (item.product?.price_cents ?? 0))}</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-destructive"
                                    onClick={() => handleRemove(item.id)}
                                    disabled={isBusy}
                                    aria-label="Remove from cart"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                            Remove
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
                <Card>
                    <CardHeader className="pb-2">
                        <p className="text-sm font-medium text-muted-foreground">Order summary</p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span className="font-medium">{formatPrice(subtotal)}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-4">
                        <Button className="w-full" size="lg">
                            Proceed to checkout
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
