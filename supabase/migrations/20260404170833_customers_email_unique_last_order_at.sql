ALTER TABLE customers ADD CONSTRAINT customers_email_unique UNIQUE (email);
ALTER TABLE customers ADD COLUMN last_order_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;