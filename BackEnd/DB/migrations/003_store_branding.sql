-- Run once against the Dominos database to enable editable store branding.
-- psql -U postgres -d Dominos -f BackEnd/DB/migrations/003_store_branding.sql

BEGIN;

CREATE TABLE IF NOT EXISTS store_branding (
    id smallint PRIMARY KEY CHECK (id = 1),
    name varchar(120) NOT NULL,
    logo_url text NOT NULL,
    updated_at timestamp without time zone NOT NULL DEFAULT now()
);

INSERT INTO store_branding (id, name, logo_url)
VALUES (1, 'DOMINOS STORE', '/images/logo/dominos_logo.jpg')
ON CONFLICT (id) DO NOTHING;

COMMIT;
