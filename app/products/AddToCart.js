'use client';

import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/useCartStore';
import { addToCartAction } from '../actions/cart';
import { useState } from 'react';

export default function AddToCart({ product }) {
    const addItem = useCartStore((state) => state.addItem);
    const [isPending, setIsPending] = useState(false);

    const handleAddToCart = async () => {
        try {
            setIsPending(true);
            addItem(product);

            const result = await addToCartAction(product.id);
            if (!result.success) {
                alert('Could not sync with the server. Please try again.', +result.message);
            }
        } catch (error) {
            console.error('Critical error adding to cart:', error);
        } finally {
            setIsPending(false);
        }
    };
    return <Button onClick={handleAddToCart}>{isPending ? 'Adding...' : 'Add to Cart'}</Button>;
}
