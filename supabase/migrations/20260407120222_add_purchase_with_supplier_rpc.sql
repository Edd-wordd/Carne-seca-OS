CREATE OR REPLACE FUNCTION add_purchase_with_supplier(
  p_supply_id uuid,
  p_supplier_name text,
  p_quantity numeric,
  p_unit_cost numeric,
  p_purchase_date date,
  p_payment_method text,
  p_purchased_by text
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_supplier_id uuid;
  v_purchase_id uuid;
BEGIN
  -- Both inserts are inside one plpgsql block.
  -- If the second insert fails, the first rolls back automatically.
  -- No orphaned supplier rows ever.

  INSERT INTO suppliers (name)
  VALUES (p_supplier_name)
  RETURNING supplier_id INTO v_supplier_id;

  INSERT INTO supply_purchases (
    supply_id,
    supplier_id,
    quantity,
    unit_cost,
    purchase_date,
    payment_method,
    purchased_by
  )
  VALUES (
    p_supply_id,
    v_supplier_id,
    p_quantity,
    p_unit_cost,
    p_purchase_date,
    p_payment_method,
    p_purchased_by
  )
  RETURNING id INTO v_purchase_id;

  RETURN v_purchase_id;
END;
$$;