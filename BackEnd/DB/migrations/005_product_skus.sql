-- 005_product_skus.sql
--
-- Per-variant stock and price.
--
--   product_variants      -> still the list of option values (Color: Red, Model: 45mm ...).
--                            New column image_url = picture shown when the option is selected.
--   product_skus          -> one row per sellable combination (Red + 45mm) with its own stock / price.
--   product_sku_options   -> which option values make up a combination.
--   order_items.product_sku_id -> which combination was bought (selected_variants JSON stays as the snapshot).
--
-- products.stock / price / discount_price stay as a cached summary of the SKUs
-- (total stock, cheapest in-stock price). The backend keeps them in sync.

BEGIN;

ALTER TABLE public.product_variants
    ADD COLUMN IF NOT EXISTS image_url text;

CREATE TABLE IF NOT EXISTS public.product_skus (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id integer NOT NULL
        REFERENCES public.products(id) ON DELETE CASCADE,
    price integer NOT NULL,
    discount_price integer,
    stock integer NOT NULL DEFAULT 0,
    CONSTRAINT product_skus_price_check CHECK (price >= 0),
    CONSTRAINT product_skus_stock_check CHECK (stock >= 0),
    CONSTRAINT product_skus_discount_check CHECK (
        discount_price IS NULL
        OR (discount_price > 0 AND discount_price < price)
    )
);

CREATE INDEX IF NOT EXISTS idx_product_skus_product_id
    ON public.product_skus (product_id);

CREATE TABLE IF NOT EXISTS public.product_sku_options (
    sku_id integer NOT NULL
        REFERENCES public.product_skus(id) ON DELETE CASCADE,
    variant_id integer NOT NULL
        REFERENCES public.product_variants(id),
    PRIMARY KEY (sku_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_product_sku_options_variant_id
    ON public.product_sku_options (variant_id);

ALTER TABLE public.order_items
    ADD COLUMN IF NOT EXISTS product_sku_id integer
        REFERENCES public.product_skus(id) ON DELETE SET NULL;

-- --------------------------------------------------------------------------
-- Backfill existing products (only those that have no SKU yet)
--
--  * no variants      -> one default SKU (stock / price copied from the product)
--  * with variants    -> one SKU for every combination of the option types
--                        (3 colors x 2 models = 6 SKUs). The old product stock
--                        is split between them so the total stays the same.
--                        Review these products in the dashboard afterwards.
-- --------------------------------------------------------------------------

DO $$
DECLARE
    prod RECORD;
    combo RECORD;
    new_sku_id integer;
    combo_count integer;
    base_stock integer;
    extra_stock integer;
    sku_stock integer;
    vid integer;
BEGIN
    FOR prod IN
        SELECT p.id, p.price, p.discount_price, p.stock
        FROM public.products p
        WHERE NOT EXISTS (
            SELECT 1 FROM public.product_skus s WHERE s.product_id = p.id
        )
        ORDER BY p.id
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM public.product_variants v WHERE v.product_id = prod.id
        ) THEN
            INSERT INTO public.product_skus (product_id, price, discount_price, stock)
            VALUES (prod.id, prod.price, prod.discount_price, prod.stock);
            CONTINUE;
        END IF;

        CREATE TEMP TABLE IF NOT EXISTS _combos (
            n integer,
            ids integer[]
        ) ON COMMIT DROP;
        TRUNCATE _combos;

        WITH RECURSIVE types AS (
            SELECT t.type, dense_rank() OVER (ORDER BY t.type) AS rn
            FROM (
                SELECT DISTINCT type
                FROM public.product_variants
                WHERE product_id = prod.id
            ) t
        ),
        combos AS (
            SELECT 1 AS depth, ARRAY[v.id] AS ids
            FROM public.product_variants v
            JOIN types t ON t.type = v.type AND t.rn = 1
            WHERE v.product_id = prod.id

            UNION ALL

            SELECT c.depth + 1, c.ids || v.id
            FROM combos c
            JOIN types t ON t.rn = c.depth + 1
            JOIN public.product_variants v
                ON v.type = t.type AND v.product_id = prod.id
        )
        INSERT INTO _combos (n, ids)
        SELECT row_number() OVER (ORDER BY c.ids), c.ids
        FROM combos c
        WHERE c.depth = (SELECT max(rn) FROM types);

        SELECT count(*) INTO combo_count FROM _combos;

        base_stock := prod.stock / combo_count;
        extra_stock := prod.stock % combo_count;

        FOR combo IN SELECT n, ids FROM _combos ORDER BY n LOOP
            sku_stock := base_stock + CASE WHEN combo.n <= extra_stock THEN 1 ELSE 0 END;

            INSERT INTO public.product_skus (product_id, price, discount_price, stock)
            VALUES (prod.id, prod.price, prod.discount_price, sku_stock)
            RETURNING id INTO new_sku_id;

            FOREACH vid IN ARRAY combo.ids LOOP
                INSERT INTO public.product_sku_options (sku_id, variant_id)
                VALUES (new_sku_id, vid);
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

COMMIT;
