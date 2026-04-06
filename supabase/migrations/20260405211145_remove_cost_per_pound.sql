DROP FUNCTION IF EXISTS update_production_batch;
CREATE OR REPLACE FUNCTION update_production_batch(
    p_production_id UUID,
    p_raw_weight NUMERIC
)
RETURNS TEXT
AS $$
DECLARE
    v_count int;
BEGIN
    UPDATE production_batches
    SET
        raw_weight = p_raw_weight,
        initial_weight = p_raw_weight,
        last_updated = now()
    WHERE production_id = p_production_id;

    GET DIAGNOSTICS v_count = ROW_COUNT;

    IF v_count = 0 THEN
        RETURN 'No rows updated';
    ELSE
        RETURN format('%s row(s) updated', v_count);
    END IF;
END;
$$ LANGUAGE plpgsql;