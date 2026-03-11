'use server';
import { createClient } from '@/lib/supabase/server';

export async function applyCoupon(couponCode) {
    // 1. Validate Input FIRST (Fail Fast)
    if (!couponCode || couponCode.trim() === '') {
        return { success: false, message: 'Please enter a code' };
    }

    console.log('Applying Coupon', couponCode);

    const supabase = await createClient();
    const currentDate = new Date().toISOString();
    const sanitizedCode = couponCode.trim().toUpperCase();

    // 2. Fetch data
    const { data: coupon, error } = await supabase.from('coupons').select('*').eq('code', sanitizedCode).maybeSingle();

    console.log('Applying Coupon', couponCode, sanitizedCode);

    // 3. Handle "Not Found" properly
    if (!coupon || error) {
        return { success: false, message: 'Invalid coupon code' };
    }

    // 4. Expiration check
    if (coupon.expiry_date && currentDate > coupon.expiry_date) {
        return { success: false, message: 'Coupon has expired' };
    }

    // 5. Usage limit check (Handling the NULL case for unlimited)
    if (coupon.max_redemptions !== null && coupon.used_count >= coupon.max_redemptions) {
        return { success: false, message: 'Coupon limit reached' };
    }

    // 6. Success - Return the goods
    // applyCoupon.js - Step 6
    return {
        success: true,
        couponId: coupon.id,
        stripeCouponId: coupon.stripe_coupon_id,
        discountPercent: coupon.value, // Force it to a number here
    };
}
