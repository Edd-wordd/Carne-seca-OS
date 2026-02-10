import { getCartItems } from '@/lib/supabase/queries';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

export default async function CartSideBarList() {
    const items = await getCartItems();

    console.log('items', items);
    if (items.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">Your cart is empty.</div>;
    }

    // this needs to format the price using the formatPrice function from the utils library
    const subtotal = items.reduce((acc, item) => acc + (item.quantity ?? 1) * item.product.price_cents, 0);

    return (
        <div className="flex flex-col h-[80vh]">
            <div className="flex-1 overflow-y-auto pr-4">
                {items.map((item) => (
                    <div key={item.id} className="flex gap-4 py-4 border-b">
                        <div className="relative h-16 w-16 bg-gray-100 rounded">
                            {/* Assuming you have image_url in products */}
                            <Image
                                src={item.product.image_url || '/placeholder.png'}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold">{item.product.name}</h4>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity ?? 1}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium">{formatPrice(item.product.price_cents)}</p>
                            {/* We will turn this into a Button with a Server Action later */}
                            <button className="text-red-500 hover:text-red-700 mt-2">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-6 border-t mt-auto">
                <div className="flex justify-between font-bold mb-4">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                </div>
                <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold">
                    Checkout
                </button>
            </div>
        </div>
    );
}
