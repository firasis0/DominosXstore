-- Apply after 003_store_branding.sql to remove the legacy logo fallback.
-- psql -U postgres -d Dominos -f BackEnd/DB/migrations/004_optional_store_branding_logo.sql

BEGIN;

ALTER TABLE store_branding
    ALTER COLUMN logo_url DROP NOT NULL;

UPDATE store_branding
SET logo_url = NULL
WHERE id = 1
  AND logo_url = '/images/logo/dominos_logo.jpg';

COMMIT;
