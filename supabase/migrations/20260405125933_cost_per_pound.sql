DROP FUNCTION IF EXISTS create_production_batch;
CREATE OR REPLACE FUNCTION create_production_batch(
    p_supplier_id   UUID,
    p_raw_weight    NUMERIC,
    p_yield_percent NUMERIC,
    p_supplier_name TEXT,
    p_address       TEXT,
    p_phone         TEXT,
    p_email         TEXT
)
RETURNS TEXT
AS $$
DECLARE
    v_year           text := to_char(NOW(), 'YYYY');
    v_next           int;
    v_batch_number   text;
    v_supplier_id    uuid;
    v_cost_per_pound numeric;
BEGIN
    -- 1. Resolve supplier
    IF p_supplier_id IS NULL THEN
        INSERT INTO suppliers (name, email, phone, address)
        VALUES (p_supplier_name, p_email, p_phone, p_address)
        RETURNING supplier_id INTO v_supplier_id;
    ELSE
        v_supplier_id := p_supplier_id;
    END IF;

    -- 2. Look up most recent meat cost from supplies
    SELECT sp.unit_cost
    INTO v_cost_per_pound
    FROM supply_purchases sp
    JOIN supplies s ON sp.supply_id = s.id
    WHERE s.category = 'meat'
    ORDER BY sp.purchase_date DESC
    LIMIT 1;

    IF v_cost_per_pound IS NULL THEN
        RAISE EXCEPTION 'No meat purchase found. Add a meat purchase in Supplies before creating a batch.';
    END IF;

    -- 3. Generate batch number
    SELECT COALESCE(MAX(NULLIF(SUBSTRING(batch_number FROM '[0-9]{3}$'), '')::int), 0) + 1
    INTO v_next
    FROM production_batches
    WHERE batch_number ~ ('^RB-' || v_year || '-[0-9]{3}$');

    v_batch_number := 'RB-' || v_year || '-' || LPAD(v_next::text, 3, '0');

    -- 4. Insert batch
    INSERT INTO production_batches (
        batch_number,
        supplier_id,
        initial_weight,
        raw_weight,
        cost_per_pound,
        yield_percent,
        tracking_status,
        created_at
    ) VALUES (
        v_batch_number,
        v_supplier_id,
        p_raw_weight,
        p_raw_weight,
        v_cost_per_pound,
        COALESCE(p_yield_percent, 0),
        'pending',
        NOW()
    );

    RETURN v_batch_number;
END;
$$ LANGUAGE plpgsql;