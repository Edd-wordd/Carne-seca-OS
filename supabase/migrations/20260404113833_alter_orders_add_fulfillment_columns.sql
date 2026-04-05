ALTER TABLE orders 
ADD COLUMN tracking_number TEXT DEFAULT NULL,
ADD COLUMN fulfillment_status TEXT DEFAULT 'unfulfilled',
ADD COLUMN shipping_address JSONB,
ADD COLUMN source TEXT DEFAULT 'website',
ADD COLUMN customer_name TEXT DEFAULT NULL;