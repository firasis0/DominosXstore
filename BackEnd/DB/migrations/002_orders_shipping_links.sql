-- Run this once against your Dominos database before testing the Orders dashboard.
-- psql -U postgres -d Dominos -f BackEnd/DB/migrations/002_orders_shipping_links.sql

BEGIN;

-- Link orders to the shipping system (provider / zone / office used for that order)
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS shipping_provider_id integer
        REFERENCES shipping_providers (id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS shipping_zone_id integer
        REFERENCES shipping_zones (id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS delivery_office_id integer
        REFERENCES delivery_offices (id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS payment_status character varying NOT NULL DEFAULT 'unpaid';

CREATE INDEX IF NOT EXISTS idx_orders_shipping_provider_id ON orders (shipping_provider_id);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_zone_id ON orders (shipping_zone_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_office_id ON orders (delivery_office_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);

-- Real status timeline — only rows that were actually recorded, never invented.
CREATE TABLE IF NOT EXISTS order_status_history (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1),
    order_id integer NOT NULL,
    status character varying NOT NULL,
    changed_at timestamp without time zone NOT NULL DEFAULT now(),
    CONSTRAINT order_status_history_pkey PRIMARY KEY (id),
    CONSTRAINT order_status_history_order_fk FOREIGN KEY (order_id)
        REFERENCES orders (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history (order_id);

COMMIT;
