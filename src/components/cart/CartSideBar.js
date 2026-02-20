import deleteCartItem from '../../app/actions/deleteCartItem';
import updateCartQuantity from '../../app/actions/updateCartQuantity';
import { getCartItems } from '@/lib/supabase/queries';
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
