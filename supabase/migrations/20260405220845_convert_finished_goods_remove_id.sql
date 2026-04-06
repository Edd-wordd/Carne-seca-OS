-- 1. Fix existing bad data (runs once at migration time)
UPDATE production_batches 
SET tracking_status = 'damaged' 
WHERE tracking_status = 'Damaged';

-- 2. Drop and recreate the function
DROP FUNCTION IF EXISTS convert_finished_goods;

CREATE OR REPLACE FUNCTION convert_finished_goods(
    p_production_id UUID,
    p_flavor_splits JSONB
)
RETURNS TEXT
AS $$
DECLARE
    split_record         record;
    total_finished_grams numeric := 0;
    v_total_bags         integer := 0;
    v_batch_id           UUID;
    v_batch_number       TEXT;
    v_raw_weight         NUMERIC;
    v_total_cost         NUMERIC;
    v_calculated_yield   NUMERIC;
BEGIN
    IF (SELECT tracking_status FROM production_batches WHERE production_id = p_production_id FOR UPDATE) = 'finished' THEN
        RAISE EXCEPTION 'Batch already converted';
    END IF;

    SELECT  batch_number, raw_weight, total_cost
    INTO  v_batch_number, v_raw_weight, v_total_cost
    FROM production_batches
    WHERE production_id = p_production_id;

    IF v_raw_weight IS NULL OR v_raw_weight <= 0 THEN
        RAISE EXCEPTION 'Invalid raw_weight for batch';
    END IF;

    SELECT SUM((value->>'bags')::int)
    INTO v_total_bags
    FROM jsonb_array_elements(p_flavor_splits);

    IF v_total_bags IS NULL OR v_total_bags = 0 THEN
        RAISE EXCEPTION 'Flavor splits contain no bags';
    END IF;

    FOR split_record IN
        SELECT * FROM jsonb_to_recordset(p_flavor_splits)
        AS x(flavor text, size_grams int, bags int)
    LOOP
        INSERT INTO finished_bags (batch_id, flavor, size_grams, stock_quantity)
        VALUES (p_production_id, split_record.flavor, split_record.size_grams, split_record.bags);

        total_finished_grams := total_finished_grams + (split_record.bags * split_record.size_grams);

        INSERT INTO production_inventory (product_id, available)
        SELECT id, split_record.bags
        FROM products
        WHERE flavor = split_record.flavor AND size_grams = split_record.size_grams
        ON CONFLICT (product_id) DO UPDATE
        SET available = production_inventory.available + EXCLUDED.available;

        UPDATE products
        SET cost_per_bag = v_total_cost / NULLIF(v_total_bags, 0),
            category     = 'carne_seca'
        WHERE flavor     = split_record.flavor
        AND size_grams   = split_record.size_grams;
    END LOOP;

    v_calculated_yield := (total_finished_grams / 453.592) / v_raw_weight;
    v_calculated_yield := GREATEST(0, LEAST(1, v_calculated_yield));

    UPDATE production_batches
    SET tracking_status = 'finished',
        yield_percent   = v_calculated_yield,
        last_updated    = now()
    WHERE production_id = p_production_id;

    RETURN 'success';
END;
$$ LANGUAGE plpgsql;