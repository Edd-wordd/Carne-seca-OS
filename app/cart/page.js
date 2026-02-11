import deleteCartItem from '../actions/deleteCartItem';
import updateCartQuantity from '../actions/updateCartQuantity';
import { getCartItems } from '@/lib/supabase/queries';
import CartPageContent from '@/components/cart/CartPageContent';

export default async function CartPage() {
    const items = await getCartItems();

    return (
        <div className="container mx-auto max-w-5xl px-4 py-12">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">Cart</h1>
                <p className="mt-1 text-muted-foreground text-sm">
                    {items.length === 0
                        ? 'No items in your cart.'
                        : `${items.length} ${items.length === 1 ? 'item' : 'items'} in your cart.`}
                </p>
            </div>

            <CartPageContent
                initialItems={items}
                onDeleteItem={deleteCartItem}
                onUpdateQuantity={updateCartQuantity}
            />
        </div>
    );
}
