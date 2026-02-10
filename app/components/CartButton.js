'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addItemToCart } from '../actions/addItemToCart';

export default function CartButton({ productId }) {
    // useTransition handles the 'loading' state automatically
    const [isPending, startTransition] = useTransition();

    const handleAdd = () => {
        // We wrap our async Server Action in startTransition
        startTransition(async () => {
            try {
                const result = await addItemToCart(productId);

                if (result?.success) {
                    toast.success('Added to cart!', {
                        description: "We've reserved your item in the kitchen.",
                    });
                } else {
                    toast.error('Kitchen Error', {
                        description: result?.message || 'Something went wrong.',
                    });
                }
            } catch (error) {
                toast.error('Connection Error', {
                    description: 'Could not reach the server.',
                });
            }
        });
    };

    return (
        <Button onClick={handleAdd} disabled={isPending} className="w-fit flex items-center justify-center gap-2">
            {isPending ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Adding...</span>
                </>
            ) : (
                'Add to Cart'
            )}
        </Button>
    );
}
