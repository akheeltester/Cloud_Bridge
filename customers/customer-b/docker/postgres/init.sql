-- CloudBridge — Customer B (BluePeak Solutions) database seed
-- Simulated application schema for migration testing
-- All data is fictional

CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    sku         VARCHAR(50) UNIQUE NOT NULL,
    price       NUMERIC(10,2),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id          SERIAL PRIMARY KEY,
    product_id  INTEGER REFERENCES products(id),
    quantity    INTEGER NOT NULL,
    status      VARCHAR(50) DEFAULT 'pending',
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed with clearly fictional data
INSERT INTO products (name, sku, price) VALUES
    ('Consulting Service Package A', 'SVC-001', 5000.00),
    ('Consulting Service Package B', 'SVC-002', 10000.00),
    ('Cloud Migration Assessment',   'SVC-003', 2500.00)
ON CONFLICT (sku) DO NOTHING;

-- Migration validation query (used in Phase 4)
-- Run this on source and target to compare row counts
-- SELECT COUNT(*) FROM products;
-- SELECT COUNT(*) FROM orders;
