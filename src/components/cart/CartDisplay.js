'use client';

import { ShoppingCart } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';

export default function CartDisplay({ count, children }) {
    return (
        <Sheet>
            <SheetTrigger>
                <span className="flex items-center gap-1">
                    <ShoppingCart className="h-5 w-5" />
                    <span>{count}</span>
                </span>
            </SheetTrigger>
            <SheetContent className="flex flex-col overflow-hidden p-0">
                <SheetHeader>
                    <SheetTitle>Cart</SheetTitle>
                    <SheetDescription>Your items and order summary.</SheetDescription>
                </SheetHeader>
                <div className="min-h-0 flex-1 overflow-y-auto">
                    {children}
                </div>
            </SheetContent>
        </Sheet>
    );
}
