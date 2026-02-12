'use client';

import { useState, useRef, useCallback, useTransition, useEffect } from 'react';
import { Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const DEBOUNCE_MS = 400;

export default function CartSideBarListContent({ initialItems = [], onDeleteItem, onUpdateQuantity }) {
    const [items, setItems] = useState(initialItems);
    const [deletingId, setDeletingId] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [isPending, startTransition] = useTransition();
    const debounceTimers = useRef({});
    const itemsRef = useRef(items);

    // Sync local state when server provides fresh data (e.g. Sheet reopen, revalidation)
    // useEffect(() => {
    //     setItems(initialItems);
    // }, [initialItems]);

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

        setItems((prev) => prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item)));

        if (debounceTimers.current[cartItemId]) {
            clearTimeout(debounceTimers.current[cartItemId]);
        }
        debounceTimers.current[cartItemId] = setTimeout(() => flushQuantityUpdate(cartItemId), DEBOUNCE_MS);
    };

    const subtotal = items.reduce((acc, item) => acc + (item.quantity ?? 1) * (item.product?.price_cents ?? 0), 0);

    if (items.length === 0) {
        return (
            <div className="flex h-[80vh] flex-col">
                <div className="flex flex-1 items-center justify-center">
                    <p className="text-muted-foreground text-center">Your cart is empty.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[80vh] flex-col">
            <div className="flex-1 overflow-y-auto pr-4">
                {items.map((item) => {
                    const qty = item.quantity ?? 1;
                    const isDeleting = deletingId === item.id;
                    const isUpdating = updatingId === item.id;
                    const isBusy = isDeleting || isUpdating;

                    return (
                        <div key={item.id} className="flex gap-4 border-b py-4">
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
                                {item.product?.image_url ? (
                                    <Image
                                        src={item.product.image_url}
                                        alt={item.product?.name ?? 'Product'}
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
                                        —
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-semibold">{item.product?.name ?? 'Product'}</h4>
                                <div className="mt-1.5 flex items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="icon-xs"
                                        onClick={() => handleQuantityChange(item.id, qty, -1)}
                                        disabled={isBusy}
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-6 text-center text-xs font-medium tabular-nums">
                                        {isUpdating ? <Loader2 className="mx-auto h-3 w-3 animate-spin" /> : qty}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon-xs"
                                        onClick={() => handleQuantityChange(item.id, qty, 1)}
                                        disabled={isBusy}
                                        aria-label="Increase quantity"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex flex-col items-end justify-between">
                                <p className="text-sm font-medium">
                                    {formatPrice(qty * (item.product?.price_cents ?? 0))}
                                </p>
                                <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => handleRemove(item.id)}
                                    disabled={isBusy}
                                    aria-label="Remove from cart"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-auto border-t pt-6">
                <div className="mb-4 flex justify-between font-semibold">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                </div>
                <Button className="w-full py-6 text-base font-semibold">Checkout</Button>
            </div>
        </div>
    );
}
