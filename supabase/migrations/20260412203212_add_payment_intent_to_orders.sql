-- Add payment intent column to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text null;

-- Drop and recreate fulfill_order with new parameter
CREATE OR REPLACE FUNCTION fulfill_order(
  p_guest_id uuid,
  p_stripe_session_id text,
  p_customer_email text,
  p_amount_total integer,
  p_customer_name text,
  p_source text,
  p_amount_discount integer,
  p_payment_intent_id text
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_id UUID;
  v_calculated_total INTEGER;
BEGIN
  -- 1. SECURITY: Recalculate total from DB prices (Anti-Tamper)
  SELECT SUM(ci.quantity * p.price_cents) INTO v_calculated_total
  FROM cart_items ci
  JOIN products p ON ci.product_id = p.id
  WHERE ci.guest_id = p_guest_id;

  IF v_calculated_total IS NULL THEN
    RAISE EXCEPTION 'Cart is empty or guest_id not found';
  END IF;

  -- 2. GUARDRAIL: Verify the paid amount matches our records
  IF v_calculated_total != p_amount_total THEN
    RAISE EXCEPTION 'Price mismatch! Potential tampering detected.';
  END IF;

  -- 3. CREATE ORDER
  INSERT INTO orders (
    guest_id, stripe_session_id, stripe_payment_intent_id,
    customer_email, amount_total, status,
    customer_name, source, amount_discount
  )
  VALUES (
    p_guest_id, p_stripe_session_id, p_payment_intent_id,
    p_customer_email, p_amount_total, 'paid',
    p_customer_name, p_source, p_amount_discount
  )
  RETURNING id INTO v_order_id;

  -- 4. Subtract stock
  UPDATE products p
  SET stock = p.stock - ci.quantity
  FROM cart_items ci
  WHERE ci.product_id = p.id AND ci.guest_id = p_guest_id;

  -- 5. Snapshot order items
  INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, product_name)
  SELECT v_order_id, ci.product_id, ci.quantity, p.price_cents, p.name
  FROM cart_items ci
  JOIN products p ON ci.product_id = p.id
  WHERE ci.guest_id = p_guest_id;

  -- 6. Clear cart
  DELETE FROM cart_items WHERE guest_id = p_guest_id;
END;
$$;