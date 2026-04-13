CREATE OR REPLACE FUNCTION create_manual_order(
  p_customer_name text,
  p_customer_email text,
  p_source text,
  p_fulfillment_status text,
  p_shipping_address jsonb,
  p_line_items jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_id uuid;
  v_amount_total integer := 0;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_price_cents integer;
  v_product_name text;
  v_stock integer;
BEGIN
  -- 1. Validate line items array
  IF jsonb_array_length(p_line_items) = 0 THEN
    RAISE EXCEPTION 'Order must have at least one line item';
  END IF;

  IF jsonb_array_length(p_line_items) > 50 THEN
    RAISE EXCEPTION 'Order cannot exceed 50 line items';
  END IF;

  -- 2. Validate stock, calculate total, subtract stock, all in one loop
  -- FOR UPDATE lock held for entire operation
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_line_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;

    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'Quantity must be greater than zero';
    END IF;

    IF v_quantity > 10000 THEN
      RAISE EXCEPTION 'Quantity cannot exceed 10,000 per line item';
    END IF;

    SELECT price_cents, stock, name
    INTO v_price_cents, v_stock, v_product_name
    FROM products
    WHERE id = v_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found: %', v_product_id;
    END IF;

    IF v_stock < v_quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product: %', v_product_name;
    END IF;

    v_amount_total := v_amount_total + (v_price_cents * v_quantity);

    -- Subtract stock while lock is held
    UPDATE products SET stock = stock - v_quantity WHERE id = v_product_id;

    -- Snapshot line item — order_id filled after insert below
    -- Store temporarily in a temp table approach isn't needed —
    -- we insert order first then items after
  END LOOP;

  -- 3. Insert order — guest_id nullable for manual orders
  INSERT INTO orders (
    customer_name,
    customer_email,
    source,
    fulfillment_status,
    shipping_address,
    amount_total,
    amount_discount,
    status,
    stripe_session_id
  )
  VALUES (
    p_customer_name,
    p_customer_email,
    p_source,
    p_fulfillment_status,
    p_shipping_address,
    v_amount_total,
    0,
    'paid',
    'manual-' || gen_random_uuid()::text
  )
  RETURNING id INTO v_order_id;

  -- 4. Insert order_items snapshot
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_line_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;

    SELECT price_cents, name INTO v_price_cents, v_product_name
    FROM products WHERE id = v_product_id;

    INSERT INTO order_items (order_id, product_id, product_name, quantity, price_at_purchase)
    VALUES (v_order_id, v_product_id, v_product_name, v_quantity, v_price_cents);
  END LOOP;

  RETURN v_order_id;
END;
$$;