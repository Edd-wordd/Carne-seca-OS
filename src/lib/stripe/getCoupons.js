import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function getCoupons() {
    const promotionalCodesList = await stripe.promotionCodes.list();

    const coupons = (promotionalCodesList.data ?? []).map((promo) => {
        return {
            code: promo.code,
            discount:
                promo.coupon?.percent_off != null
                    ? { type: 'percent', value: promo.coupon.percent_off }
                    : promo.coupon?.amount_off != null
                      ? { type: 'fixed', value: promo.coupon.amount_off, currency: promo.coupon.currency }
                      : null,
            uses: {
                max: promo.max_redemptions,
                redeemed: promo.times_redeemed,
            },
            expires: promo?.expires_at ? new Date(promo.expires_at * 1000).toISOString() : null,
            status: promo.active ? 'active' : 'inactive',
            metadata: promo.metadata ?? {},
        };
    });
    return coupons;
}
