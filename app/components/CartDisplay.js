'use client';

import { ShoppingCart } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';

export default function CartDisplay({ count, children }) {
    return (
        <Sheet>
            <SheetTrigger>
                <ShoppingCart className="h-5 w-5" />
                <span>{count}</span>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Cart</SheetTitle>
                    <SheetDescription>Your cart items will be displayed here.</SheetDescription>
                </SheetHeader>
                {children}
            </SheetContent>
        </Sheet>
    );
}
