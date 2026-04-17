ALTER TABLE orders
ADD COLUMN updated_at timestamp with time zone DEFAULT now();