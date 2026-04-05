import { getCoupons } from '@/lib/stripe/getCoupons';
import { CouponClient } from './_components/CouponClient';

export default async function CouponsPage() {
    const coupons = await getCoupons();

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-zinc-100 text-xl font-semibold tracking-tight">Coupons</h1>
                <p className="text-zinc-500 mt-1 text-sm">Promo codes from Stripe</p>
            </div>

            <CouponClient initialCoupons={coupons} />
        </div>
    );
}
