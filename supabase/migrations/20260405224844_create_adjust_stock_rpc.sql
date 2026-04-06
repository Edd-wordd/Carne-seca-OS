CREATE OR REPLACE FUNCTION adjust_stock(
    p_product_id UUID,
    p_adjust_type TEXT,
    p_quantity NUMERIC,
    p_reason TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_available NUMERIC;
    v_new_available NUMERIC;
    v_cost_per_bag NUMERIC;
    v_change_amount NUMERIC;
    v_total_loss_cost NUMERIC;
BEGIN
    -- 1. Lock the inventory row so two concurrent calls can't both read
    --    the same available value and both write back — race condition fix
    SELECT available INTO v_current_available
    FROM production_inventory
    WHERE product_id = p_product_id
    FOR UPDATE;

    IF v_current_available IS NULL THEN
        RAISE EXCEPTION 'Inventory row not found for product %', p_product_id;
    END IF;

    -- 2. Calculate change amount
    v_change_amount := CASE WHEN p_adjust_type = 'add' THEN p_quantity ELSE -p_quantity END;
    v_new_available := v_current_available + v_change_amount;

    -- 3. Guard: can't go below zero
    IF v_new_available < 0 THEN
        RAISE EXCEPTION 'Insufficient stock: would go below 0';
    END IF;

    -- 4. Get cost_per_bag for loss calculation
    SELECT cost_per_bag INTO v_cost_per_bag
    FROM products
    WHERE id = p_product_id;

    v_total_loss_cost := CASE 
        WHEN p_adjust_type = 'remove' THEN p_quantity * COALESCE(v_cost_per_bag, 0)
        ELSE 0
    END;

    -- 5. Update inventory
    UPDATE production_inventory
    SET available = v_new_available
    WHERE product_id = p_product_id;

    -- 6. Insert audit log — atomic with step 5, same transaction
    --    If this fails, the UPDATE above rolls back automatically
    INSERT INTO adjustments_log (
        product_id, change_amount, reason,
        adjustment_type, notes, total_loss_cost
    ) VALUES (
        p_product_id, v_change_amount, p_reason,
        p_reason, p_notes, v_total_loss_cost
    );

    RETURN 'ok';
END;
$$;