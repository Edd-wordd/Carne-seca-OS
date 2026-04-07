import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function getCoupons() {
    try {
        const promotionalCodesList = await stripe.promotionCodes.list({ expand: ['data.promotion.coupon'] });

        return (promotionalCodesList.data ?? []).map((promo) => ({
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
                max: promo.max_redemptions ?? null,
                redeemed: promo.times_redeemed ?? 0,
            },
            expires: promo.expires_at ? new Date(promo.expires_at * 1000).toISOString() : null,
            status: promo.active ? 'active' : 'inactive',
            metadata: { ...promo.promotion?.coupon?.metadata, ...promo.metadata },
        }));
    } catch (err) {
        console.error('getCoupons failed:', err);
        return [];
    }
}
