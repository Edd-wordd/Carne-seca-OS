import CartCounter from "@/components/cart/CartCounter";

export default function StoreHeader() {
    return (
        <header className="flex justify-end border-b px-4 py-3">
            <CartCounter />
        </header>
    );
}
