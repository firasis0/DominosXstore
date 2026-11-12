/*
|--------------------------------------------------------------------------
| Product variants (options + sellable combinations)
|--------------------------------------------------------------------------
|
| product_variants     -> option values   (color: Red, model: 45mm ...)
| product_skus         -> sellable combos (Red + 45mm) with their own stock / price
| product_sku_options  -> links a combo to its option values
|
| products.stock / price / discount_price are a cached summary of the SKUs and
| are only ever written by syncProductSummary().
*/

const COLOR_TYPE = "color";

const httpError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const optionKey = (type, value) => `${type}\u0000${value}`;

const isNonNegativeInteger = (value) =>
    Number.isInteger(value) && value >= 0;

/*
|--------------------------------------------------------------------------
| Reading products (dashboard + storefront share the same shape)
|--------------------------------------------------------------------------
*/

const PRODUCT_DETAILS_SQL = `
    SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.discount_price,
        p.stock,
        p.is_active,
        p.is_on_sale,
        p.created_at,
        p.category_id,
        c.name AS category_name,
        p.brand_id,
        b.name AS brand_name,

        COALESCE((
            SELECT json_agg(pi.image_url ORDER BY pi.id)
            FROM product_images pi
            WHERE pi.product_id = p.id
              AND pi.image_url IS NOT NULL
        ), '[]'::json) AS images,

        COALESCE((
            SELECT json_agg(
                jsonb_build_object(
                    'id', pv.id,
                    'type', pv.type,
                    'value', pv.value,
                    'color_hex', pv.color_hex,
                    'image_url', pv.image_url
                )
                ORDER BY pv.id
            )
            FROM product_variants pv
            WHERE pv.product_id = p.id
        ), '[]'::json) AS variants,

        COALESCE((
            SELECT json_agg(
                jsonb_build_object(
                    'id', ps.id,
                    'price', ps.price,
                    'discount_price', ps.discount_price,
                    'stock', ps.stock,
                    'options', COALESCE((
                        SELECT jsonb_object_agg(pv.type, pv.value)
                        FROM product_sku_options pso
                        INNER JOIN product_variants pv
                            ON pv.id = pso.variant_id
                        WHERE pso.sku_id = ps.id
                    ), '{}'::jsonb)
                )
                ORDER BY ps.id
            )
            FROM product_skus ps
            WHERE ps.product_id = p.id
        ), '[]'::json) AS skus

    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN brands b ON b.id = p.brand_id
`;

export const getProductsWithVariants = async (
    queryable,
    { productId = null, onlyActive = false } = {}
) => {
    const conditions = [];
    const params = [];

    if (productId !== null) {
        params.push(productId);
        conditions.push(`p.id = $${params.length}`);
    }

    if (onlyActive) {
        conditions.push("p.is_active = true");
    }

    const where = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const { rows } = await queryable.query(
        `${PRODUCT_DETAILS_SQL} ${where} ORDER BY p.created_at DESC, p.id DESC;`,
        params
    );

    return rows;
};

/*
|--------------------------------------------------------------------------
| Validating what the dashboard sends
|--------------------------------------------------------------------------
|
| variants: [{ type, value, color_hex, image_url }]          option values
| skus:     [{ id?, price, discount_price, stock, options }] options = { type: value }
*/

export const normalizeVariantPayload = ({
    variants,
    skus,
    images,
    isOnSale,
}) => {
    const rawVariants = Array.isArray(variants) ? variants : [];
    const rawSkus = Array.isArray(skus) ? skus : [];
    const imageList = Array.isArray(images) ? images : [];

    if (rawSkus.length === 0) {
        throw httpError(
            400,
            "Add at least one variant with its stock and price."
        );
    }

    // ---- option values --------------------------------------------------

    const typeSpelling = new Map(); // lower-case -> spelling used in the DB
    const optionValues = [];
    const seenOptions = new Set();

    for (const raw of rawVariants) {
        const rawType = String(raw?.type ?? "").trim();
        const value = String(raw?.value ?? "").trim();

        if (!rawType || !value) {
            throw httpError(
                400,
                "Every option needs a name and a value."
            );
        }

        const lowerType = rawType.toLowerCase();
        const type =
            lowerType === COLOR_TYPE
                ? COLOR_TYPE
                : typeSpelling.get(lowerType) ?? rawType;

        typeSpelling.set(lowerType, type);

        const key = optionKey(type, value);

        if (seenOptions.has(key)) {
            throw httpError(
                400,
                `The ${type} "${value}" is listed twice.`
            );
        }

        seenOptions.add(key);

        let colorHex = null;

        if (type === COLOR_TYPE) {
            colorHex = String(raw?.color_hex ?? "").trim();

            if (!/^#[0-9a-fA-F]{6}$/.test(colorHex)) {
                throw httpError(
                    400,
                    `Pick a color for "${value}".`
                );
            }
        }

        const imageUrl =
            raw?.image_url && imageList.includes(raw.image_url)
                ? raw.image_url
                : null;

        optionValues.push({
            type,
            value,
            color_hex: colorHex,
            image_url: imageUrl,
        });
    }

    const optionTypes = [...new Set(optionValues.map((o) => o.type))];

    // ---- combinations ----------------------------------------------------

    const seenCombinations = new Set();
    const normalizedSkus = [];

    for (const raw of rawSkus) {
        const price = Number(raw?.price);
        const stock = Number(raw?.stock);

        const discount =
            raw?.discount_price === null ||
            raw?.discount_price === undefined ||
            raw?.discount_price === ""
                ? null
                : Number(raw.discount_price);

        if (!isNonNegativeInteger(price)) {
            throw httpError(
                400,
                "Every variant needs a valid price."
            );
        }

        if (!isNonNegativeInteger(stock)) {
            throw httpError(
                400,
                "Every variant needs a valid stock quantity (0 or more)."
            );
        }

        if (discount !== null) {
            if (
                !Number.isInteger(discount) ||
                discount <= 0 ||
                discount >= price
            ) {
                throw httpError(
                    400,
                    "A sale price must be lower than the variant price."
                );
            }
        } else if (isOnSale) {
            throw httpError(
                400,
                "The product is on sale: give every variant a sale price."
            );
        }

        const rawOptions =
            raw?.options &&
            typeof raw.options === "object" &&
            !Array.isArray(raw.options)
                ? raw.options
                : {};

        const options = {};

        for (const [rawType, rawValue] of Object.entries(rawOptions)) {
            const lowerType = String(rawType).trim().toLowerCase();
            const type = typeSpelling.get(lowerType);
            const value = String(rawValue ?? "").trim();

            if (!type || !seenOptions.has(optionKey(type, value))) {
                throw httpError(
                    400,
                    `Unknown option "${rawType}: ${rawValue}".`
                );
            }

            options[type] = value;
        }

        for (const type of optionTypes) {
            if (!options[type]) {
                throw httpError(
                    400,
                    `Choose a ${type} for every variant.`
                );
            }
        }

        const combinationKey = optionTypes
            .map((type) => optionKey(type, options[type]))
            .join("|");

        if (seenCombinations.has(combinationKey)) {
            throw httpError(
                400,
                "Two variants have exactly the same options."
            );
        }

        seenCombinations.add(combinationKey);

        const id =
            Number.isInteger(Number(raw?.id)) && Number(raw.id) > 0
                ? Number(raw.id)
                : null;

        normalizedSkus.push({
            id,
            price,
            discount_price: discount,
            stock,
            options,
        });
    }

    // Option values that no variant uses are dropped.
    const usedOptions = new Set();

    for (const sku of normalizedSkus) {
        for (const [type, value] of Object.entries(sku.options)) {
            usedOptions.add(optionKey(type, value));
        }
    }

    return {
        optionValues: optionValues.filter((o) =>
            usedOptions.has(optionKey(o.type, o.value))
        ),
        skus: normalizedSkus,
    };
};

/*
|--------------------------------------------------------------------------
| Saving options + combinations (inside the caller's transaction)
|--------------------------------------------------------------------------
*/

export const saveProductVariants = async (
    client,
    productId,
    { optionValues, skus }
) => {
    // 1. Option values (keep ids stable so nothing else breaks)
    const variantIdByKey = new Map();

    for (const option of optionValues) {
        const { rows } = await client.query(
            `
                INSERT INTO product_variants (
                    product_id, type, value, color_hex, image_url
                )
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (product_id, type, value)
                DO UPDATE SET
                    color_hex = EXCLUDED.color_hex,
                    image_url = EXCLUDED.image_url
                RETURNING id;
            `,
            [
                productId,
                option.type,
                option.value,
                option.color_hex,
                option.image_url,
            ]
        );

        variantIdByKey.set(
            optionKey(option.type, option.value),
            rows[0].id
        );
    }

    // 2. Combinations
    const { rows: existingSkuRows } = await client.query(
        "SELECT id FROM product_skus WHERE product_id = $1;",
        [productId]
    );

    const existingSkuIds = new Set(
        existingSkuRows.map((row) => Number(row.id))
    );

    const keptSkuIds = new Set();

    for (const sku of skus) {
        let skuId = sku.id;

        if (skuId !== null && existingSkuIds.has(skuId)) {
            await client.query(
                `
                    UPDATE product_skus
                    SET price = $1, discount_price = $2, stock = $3
                    WHERE id = $4 AND product_id = $5;
                `,
                [
                    sku.price,
                    sku.discount_price,
                    sku.stock,
                    skuId,
                    productId,
                ]
            );

            await client.query(
                "DELETE FROM product_sku_options WHERE sku_id = $1;",
                [skuId]
            );
        } else {
            const { rows } = await client.query(
                `
                    INSERT INTO product_skus (
                        product_id, price, discount_price, stock
                    )
                    VALUES ($1, $2, $3, $4)
                    RETURNING id;
                `,
                [
                    productId,
                    sku.price,
                    sku.discount_price,
                    sku.stock,
                ]
            );

            skuId = rows[0].id;
        }

        keptSkuIds.add(Number(skuId));

        for (const [type, value] of Object.entries(sku.options)) {
            await client.query(
                `
                    INSERT INTO product_sku_options (sku_id, variant_id)
                    VALUES ($1, $2);
                `,
                [skuId, variantIdByKey.get(optionKey(type, value))]
            );
        }
    }

    const removedSkuIds = [...existingSkuIds].filter(
        (id) => !keptSkuIds.has(id)
    );

    if (removedSkuIds.length > 0) {
        // order_items.product_sku_id becomes NULL, the order keeps its JSON snapshot
        await client.query(
            "DELETE FROM product_skus WHERE id = ANY($1::int[]);",
            [removedSkuIds]
        );
    }

    // 3. Option values nobody uses any more
    await client.query(
        `
            DELETE FROM product_variants pv
            WHERE pv.product_id = $1
              AND NOT EXISTS (
                  SELECT 1
                  FROM product_sku_options pso
                  WHERE pso.variant_id = pv.id
              );
        `,
        [productId]
    );
};

/*
|--------------------------------------------------------------------------
| products.stock / price / discount_price  <-  summary of the SKUs
|--------------------------------------------------------------------------
|
| stock           = total of every SKU
| price           = the cheapest SKU that is still in stock (cheapest overall
|                   when everything is sold out)
| isOnSale        = pass the dashboard value, or null to keep the current one
*/

export const syncProductSummary = async (
    client,
    productId,
    isOnSale = null
) => {
    const { rows } = await client.query(
        `
            WITH sale AS (
                SELECT COALESCE($2::boolean, is_on_sale) AS on_sale
                FROM products
                WHERE id = $1
            ),
            candidates AS (
                SELECT
                    ps.*,
                    CASE
                        WHEN sale.on_sale AND ps.discount_price IS NOT NULL
                            THEN ps.discount_price
                        ELSE ps.price
                    END AS effective_price
                FROM product_skus ps, sale
                WHERE ps.product_id = $1
            ),
            cheapest AS (
                SELECT *
                FROM candidates
                ORDER BY (stock > 0) DESC, effective_price ASC, id ASC
                LIMIT 1
            ),
            totals AS (
                SELECT COALESCE(SUM(stock), 0)::int AS stock
                FROM candidates
            )
            UPDATE products p
            SET
                stock = totals.stock,
                price = cheapest.price,
                discount_price =
                    CASE WHEN sale.on_sale THEN cheapest.discount_price END,
                is_on_sale =
                    sale.on_sale AND cheapest.discount_price IS NOT NULL
            FROM cheapest, totals, sale
            WHERE p.id = $1
            RETURNING p.stock, p.price, p.discount_price, p.is_on_sale;
        `,
        [productId, isOnSale]
    );

    return rows[0] ?? null;
};

export const effectiveSkuPrice = (product, sku) =>
    product.is_on_sale && sku.discount_price !== null
        ? Number(sku.discount_price)
        : Number(sku.price);
