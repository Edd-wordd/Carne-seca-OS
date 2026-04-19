CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('packaging', 'raw_materials', 'seasoning', 'logistics', 'other')),
    vendor TEXT NOT NULL,
    vendor_id UUID REFERENCES suppliers(supplier_id),
    note TEXT,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('credit_card', 'debit_card', 'cash', 'check', 'venmo', 'zelle', 'wire', 'other')),
    purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    amount_cents INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);