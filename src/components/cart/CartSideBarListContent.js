'use client';

import { useState, useRef, useCallback, useTransition, useEffect } from 'react';
import { Loader2, Minus, Plus, Trash2, Tag } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '../../lib/utils.js';
import { Button } from '../../components/ui/button.jsx';
import { checkout } from '../../../app/actions/checkout.js';
import { applyCoupon } from '../../../app/actions/applyCoupon.js';

const DEBOUNCE_MS = 400;

export default function CartSideBarListContent({ initialItems = [], onDeleteItem, onUpdateQuantity }) {
    const [items, setItems] = useState(initialItems);
    const [deletingId, setDeletingId] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [isPending, startTransition] = useTransition();
    const [giftNote, setGiftNote] = useState('');
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const debounceTimers = useRef({});
    const itemsRef = useRef(items);

    const [isApplying, setIsApplying] = useState(false);
    const [couponData, setCouponData] = useState(null); // To store { id, stripe_id, percent }

    const handleApplyDiscount = async () => {
        const code = discountCode.trim();
        if (!code) return;

        setIsApplying(true);
        const result = await applyCoupon(code); // Using your imported Server Action
        setIsApplying(false);

        if (result?.success) {
            setCouponData(result);
            setAppliedDiscount(result.discountPercent); // Keeps your existing UI logic working
        } else {
            setCouponData(null);
            setAppliedDiscount(null);
            alert(result?.message || 'Invalid code');
        }
        console.log('SERVER ACTION RESULT:', result); // DEBUG THIS LINE
        console.log('1. Raw Result from Server:', result);
        console.log('2. Type of discountPercent:', typeof result?.discountPercent);
    };

    const handleCheckout = async () => {
        startTransition(async () => {
            // Pass the Stripe ID for the discount and the DB ID for the fulfillment record
            const result = await checkout(couponData?.stripeCouponId, couponData?.couponId);

            if (result.success && result.url) {
                window.location.href = result.url;
            } else {
                alert(result.error || 'Checkout failed.');
            }
        });
    };
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

        setItems((prev) => prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item)));

        if (debounceTimers.current[cartItemId]) {
            clearTimeout(debounceTimers.current[cartItemId]);
        }
        debounceTimers.current[cartItemId] = setTimeout(() => flushQuantityUpdate(cartItemId), DEBOUNCE_MS);
    };

    const subtotal = items.reduce((acc, item) => acc + (item.quantity ?? 1) * (item.product?.price_cents ?? 0), 0);
    // const discountAmount = appliedDiscount ? Math.round((subtotal * appliedDiscount) / 100) : 0;
    // Force the discount to be a number using Number()
    const discountAmount = appliedDiscount ? Math.round((subtotal * Number(appliedDiscount)) / 100) : 0;
    const totalBeforeTax = Math.max(0, subtotal - discountAmount);

    if (items.length === 0) {
        return (
            <div className="flex min-h-0 flex-1 flex-col px-4 py-6">
                <div className="flex flex-1 items-center justify-center">
                    <p className="text-muted-foreground text-center">Your cart is empty.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 px-4 py-4">
            {/* Cart items */}
            <section aria-label="Cart items">
                <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
                <div className="space-y-0">
                    {items.map((item) => {
                        const qty = item.quantity ?? 1;
                        const isDeleting = deletingId === item.id;
                        const isUpdating = updatingId === item.id;
                        const isBusy = isDeleting || isUpdating;

                        return (
                            <div key={item.id} className="flex gap-3 border-b border-border/60 py-3 first:pt-0">
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                                    {item.product?.image_url ? (
                                        <Image
                                            src={item.product.image_url}
                                            alt={item.product?.name ?? 'Product'}
                                            fill
                                            className="object-cover"
                                            sizes="56px"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
                                            —
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1 space-y-1">
                                    <h4 className="text-sm font-semibold leading-tight">
                                        {item.product?.name ?? 'Product'}
                                    </h4>
                                    {item.product?.description && (
                                        <p className="text-muted-foreground text-xs line-clamp-1 leading-snug">
                                            {item.product.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-1.5 pt-0.5">
                                        <span className="text-muted-foreground text-xs">Qty</span>
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
                                <div className="flex flex-col items-end justify-between gap-1">
                                    <p className="text-sm font-semibold">
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
            </section>

            {/* Gift note */}
            <div className="space-y-1.5 border-b border-border/60 pb-4">
                <label className="text-muted-foreground block text-xs font-medium">Gift note (optional)</label>
                <textarea
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    placeholder="Add a personal message..."
                    className="placeholder:text-muted-foreground/60 w-full resize-none rounded-md border border-input bg-background px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={2}
                />
            </div>

            {/* Discount code */}
            <div className="space-y-2">
                <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                    <Tag className="h-3.5 w-3.5" />
                    Discount code
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder="Enter code"
                        className="placeholder:text-muted-foreground/60 flex-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <Button variant="outline" size="sm" onClick={handleApplyDiscount} disabled={isApplying}>
                        {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                    </Button>
                </div>
                {appliedDiscount && (
                    <p className="text-emerald-600 text-xs">Code applied — {formatPrice(discountAmount)} off</p>
                )}
            </div>

            {/* Order summary */}
            <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-medium text-emerald-600">-{formatPrice(discountAmount)}</span>
                    </div>
                )}
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-muted-foreground text-xs">Calculated at checkout</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(totalBeforeTax)}</span>
                </div>
                <Button
                    className="mt-2 w-full py-4 text-sm font-semibold"
                    onClick={handleCheckout}
                    disabled={isPending}
                >
                    {isPending ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Checkout'}
                </Button>
            </div>
        </div>
    );
}
