import deleteCartItem from '../../app/actions/cart/deleteCartItem';
import updateCartQuantity from '../../app/actions/cart/updateCartQuantity';
import { getCartItems } from '@/lib/supabase/queries/cart-queries';
import CartSideBarListContent from './CartSideBarListContent';

export default async function CartSideBarList() {
    const items = await getCartItems();

    return (
        <CartSideBarListContent
            initialItems={items}
            onDeleteItem={deleteCartItem}
            onUpdateQuantity={updateCartQuantity}
        />
    );
}
