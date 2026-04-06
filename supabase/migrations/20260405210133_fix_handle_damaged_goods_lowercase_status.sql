DROP FUNCTION IF EXISTS handle_damaged_goods;
CREATE OR REPLACE FUNCTION handle_damaged_goods(
    p_production_id UUID,
    p_amount_lost DECIMAL,
    p_reason TEXT
)
RETURNS TEXT
AS $$
DECLARE
  v_cost_per_pound DECIMAL; 
  v_current_weight DECIMAL;
  v_new_weight DECIMAL;
  v_total_loss_val DECIMAL;
BEGIN
  -- 1. Fetch Source of Truth
  SELECT cost_per_pound, raw_weight 
  INTO v_cost_per_pound, v_current_weight
  FROM production_batches
  WHERE production_id = p_production_id;

  -- 2. Validation
  IF p_amount_lost > v_current_weight THEN
    RAISE EXCEPTION 'Cannot damage % lbs; only % lbs available.', p_amount_lost, v_current_weight;
  END IF;

  -- 3. Calculations
  v_new_weight := v_current_weight - p_amount_lost;
  v_total_loss_val := p_amount_lost * v_cost_per_pound;

  -- 4. Audit Trail
  INSERT INTO waste_logs (
    production_id, 
    amount_lost, 
    cost_at_time_of_loss, 
    total_loss_value, 
    reason
  ) VALUES (
    p_production_id, 
    p_amount_lost, 
    v_cost_per_pound, 
    v_total_loss_val, 
    p_reason
  );

  -- 5. Inventory Update
UPDATE production_batches
  SET 
    raw_weight = v_new_weight,
    tracking_status = CASE WHEN v_new_weight <= 0 THEN 'damaged' ELSE 'processing' END,
    last_updated = now()
  WHERE production_id = p_production_id;
  
  RETURN 'success';
END;

$$ LANGUAGE plpgsql;