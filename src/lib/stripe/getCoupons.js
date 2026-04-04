import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function getCoupons() {
    const promotionalCodesList = await stripe.promotionCodes.list({ expand: ['data.promotion.coupon'] });

    const coupons = (promotionalCodesList.data ?? []).map((promo) => {
        return {
            id: promo.id,
            code: promo.code,
            discount:
                promo.promotion?.coupon?.percent_off != null
                    ? { type: 'percent', value: promo.promotion.coupon.percent_off }
                    : promo.promotion?.coupon?.amount_off != null
                      ? {
                            type: 'fixed',
                            value: promo.promotion.coupon.amount_off,
                            currency: promo.promotion.coupon.currency,
                        }
                      : null,
            uses: {
                max: promo.max_redemptions,
                redeemed: promo.times_redeemed,
            },
            expires: promo?.expires_at ? new Date(promo.expires_at * 1000).toISOString() : null,
            status: promo.active ? 'active' : 'inactive',
            metadata: { ...promo.promotion?.coupon?.metadata, ...promo.metadata },
        };
    });
    return coupons;
}
