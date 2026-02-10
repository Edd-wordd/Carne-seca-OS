import { getCartCount } from '@/lib/supabase/queries';
import CartDisplay from './CartDisplay';
import CartSideBarList from './CartSideBarList';

export default async function CartCounter() {
    const count = await getCartCount();
    return (
        <CartDisplay count={count}>
            <CartSideBarList />
        </CartDisplay>
    );
}
