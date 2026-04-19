ALTER TABLE expenses DROP CONSTRAINT expenses_category_check;
ALTER TABLE expenses ADD CONSTRAINT expenses_category_check 
  CHECK (category IN ('packaging', 'raw_materials', 'seasoning', 'logistics', 'other', 'software'));