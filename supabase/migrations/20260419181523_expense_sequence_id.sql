CREATE SEQUENCE IF NOT EXISTS expenses_number_seq START 1;

ALTER TABLE expenses 
ADD COLUMN expense_number TEXT NOT NULL DEFAULT 'EXP-' || LPAD(nextval('expenses_number_seq')::text, 4, '0');