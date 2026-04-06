CREATE OR REPLACE FUNCTION add_inventory(
    p_sku TEXT,
    p_name TEXT,
    p_cost_per_bag NUMERIC,
    p_price_cents INTEGER,
    p_stock NUMERIC,
    p_low_threshold NUMERIC,
    p_consignment NUMERIC
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_product_id UUID;
BEGIN
    INSERT INTO products (sku, name, cost_per_bag, price_cents, category)
    VALUES (p_sku, p_name, p_cost_per_bag, p_price_cents, 'merch')
    RETURNING id INTO v_product_id;

    INSERT INTO production_inventory (product_id, available, consignment, low_threshold)
    VALUES (v_product_id, p_stock, p_consignment, p_low_threshold);

    RETURN 'ok';
END;
$$;