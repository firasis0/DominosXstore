import db from '../DB/db.js';

//Fetching the products :
export const getDashboardProducts = async (req,res) => {
    try{
        const queryText = `
        SELECT
        p.id,
        p.name,
        p.category_id,
        p.brand_id,
        p.price,
        p.discount_price,
        p.stock,
        p.is_active,
        p.is_on_sale,
        p.description,
        p.created_at,
        c.name AS category_name,
        B.name AS brand_name,
        COALESCE(
          json_agg(DISTINCT pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL), '[]'
        ) AS images,
        COALESCE(
        json_agg(DISTINCT jsonb_build_object('id', pv.id, 'type', pv.type, 'value', pv.value, 'color_hex', pv.color_hex)) 
          FILTER (WHERE pv.id IS NOT NULL), '[]'
          ) AS variants
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        LEFT JOIN product_images pi ON p.id = pi.product_id
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        GROUP BY p.id, c.name, b.name
        ORDER BY p.created_at DESC;
        `;

        const { rows } = await db.query(queryText);

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });

    }catch(error){
        console.error('Error fetching dashboard products', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching products'
        })
    }
}

//Update product active status :
export const toggleProductActive = async (req,res) => {

    try{
        const { id } = req.params;
        const { is_active } = req.body;

        if(typeof is_active !== 'boolean'){
            return res.status(400).json({
                success : false,
                message : 'is_active must be a boolean'
            });
        }

        const queryText = `
        UPDATE products
        SET is_active = $1
        where id = $2
        RETURNING id, is_active;
        `;

        const { rows } = await db.query(queryText, [
            is_active,
            id
        ]);

        if (rows.length === 0 ){
            return res.status(404).json({
                success : false,
                message : 'Product not found'
            });
        }

        res.status(200).json({
            success : true,
            message : 'Product active status updated',
            data : rows[0]
        })
    }catch(error){
        console.error('Error updating product active status', error)
        res.status(500).json({
            success : false,
            message : 'Server error while updating product'
        })
    }


}

//Delete Product :
// Delete product or deactivate if it has existing orders
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Try to delete the product
        const queryText = `
            DELETE FROM products
            WHERE id = $1
            RETURNING id;
        `;

        const { rows } = await db.query(queryText, [id]);

        // Product doesn't exist
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        return res.status(200).json({
            success: true,
            action: "deleted",
            message: "Product has been deleted",
            data: rows[0],
        });

    } catch (error) {
        // PostgreSQL foreign-key violation
        if (error.code === "23503") {
            try {
                const deactivateQuery = `
                    UPDATE products
                    SET is_active = false
                    WHERE id = $1
                    RETURNING id, is_active;
                `;

                const { rows } = await db.query(
                    deactivateQuery,
                    [req.params.id]
                );

                if (rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Product not found",
                    });
                }

                return res.status(200).json({
                    success: true,
                    action: "deactivated",
                    message:
                        "Product is part of existing orders and has been deactivated instead of deleted.",
                    data: rows[0],
                });
            } catch (deactivateError) {
                console.error(
                    "Error deactivating product:",
                    deactivateError
                );

                return res.status(500).json({
                    success: false,
                    message: "Server error while deactivating product",
                });
            }
        }

        console.error("Error deleting product:", error);

        return res.status(500).json({
            success: false,
            message: "Server error when deleting a product",
        });
    }
};

// Create a new product
export const createProduct = async (req, res) => {
    const client = await db.connect();

    try {
        const {
            name,
            description,
            price,
            discount_price,
            category_id,
            brand_id,
            stock,
            is_on_sale,
            is_active,
            images,
            variants
        } = req.body;

        // Basic validation
        if (
            !name ||
            price === undefined ||
            category_id === undefined ||
            brand_id === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: 'Name, price, category and brand are required'
            });
        }

        if (Number(price) < 0 || Number(stock) < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price and stock cannot be negative'
            });
        }

        await client.query('BEGIN');

        // 1. Create product
        const productQuery = `
            INSERT INTO products (
                name,
                description,
                price,
                discount_price,
                category_id,
                brand_id,
                stock,
                is_on_sale,
                is_active
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;

        const productValues = [
            name,
            description || null,
            Number(price),
            discount_price === null || discount_price === ''
                ? null
                : Number(discount_price),
            Number(category_id),
            Number(brand_id),
            Number(stock) || 0,
            Boolean(is_on_sale),
            Boolean(is_active)
        ];

        const { rows: productRows } = await client.query(
            productQuery,
            productValues
        );

        const product = productRows[0];

        // 2. Create product images
        if (Array.isArray(images) && images.length > 0) {
            for (const imageUrl of images) {
                if (!imageUrl) continue;

                await client.query(
                    `
                    INSERT INTO product_images (
                        product_id,
                        image_url
                    )
                    VALUES ($1, $2);
                    `,
                    [product.id, imageUrl]
                );
            }
        }

        // 3. Create product variants
        if (Array.isArray(variants) && variants.length > 0) {
            for (const variant of variants) {
                if (!variant.type || variant.value === undefined) {
                    continue;
                }

                await client.query(
                    `
                    INSERT INTO product_variants (
                        product_id,
                        type,
                        value,
                        color_hex
                    )
                    VALUES ($1, $2, $3, $4);
                    `,
                    [
                        product.id,
                        variant.type,
                        variant.value,
                        variant.type === "color"
                        ? variant.color_hex || null
                        : null
                    ]
                );
            }
        }

        await client.query('COMMIT');

        // Return the created product
        const createdProductQuery = `
    SELECT
        p.id,
        p.name,
        p.category_id,
        p.brand_id,
        p.price,
        p.discount_price,
        p.stock,
        p.is_active,
        p.is_on_sale,
        p.description,
        p.created_at,
        c.name AS category_name,
        b.name AS brand_name,
        COALESCE(
            json_agg(DISTINCT pi.image_url)
            FILTER (WHERE pi.image_url IS NOT NULL),
            '[]'
        ) AS images,
        COALESCE(
            json_agg(
                DISTINCT jsonb_build_object(
                    'id', pv.id,
                    'type', pv.type,
                    'value', pv.value,
                    'color_hex', pv.color_hex
                )
            )
            FILTER (WHERE pv.id IS NOT NULL),
            '[]'
        ) AS variants
    FROM products p
    LEFT JOIN categories c
        ON p.category_id = c.id
    LEFT JOIN brands b
        ON p.brand_id = b.id
    LEFT JOIN product_images pi
        ON p.id = pi.product_id
    LEFT JOIN product_variants pv
        ON p.id = pv.product_id
    WHERE p.id = $1
    GROUP BY p.id, c.name, b.name;
`;

const { rows: createdProductRows } = await client.query(
    createdProductQuery,
    [product.id]
);

res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: createdProductRows[0]
});

    } catch (error) {
        await client.query('ROLLBACK');

        console.error('Error creating product:', error);

        res.status(500).json({
            success: false,
            message: 'Server error while creating product'
        });

    } finally {
        client.release();
    }
};

//Edit product
// Update product
export const updateProduct = async (req, res) => {
    const client = await db.connect();

    try {
        const { id } = req.params;

        const {
            name,
            description,
            price,
            discount_price,
            category_id,
            brand_id,
            stock,
            is_on_sale,
            is_active,
            images,
            variants,
        } = req.body;

        if (
            !name ||
            price === undefined ||
            category_id === undefined ||
            brand_id === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, price, category and brand are required",
            });
        }

        if (Number(price) < 0 || Number(stock) < 0) {
            return res.status(400).json({
                success: false,
                message: "Price and stock cannot be negative",
            });
        }

        await client.query("BEGIN");

        // 1. Update product
        const productQuery = `
            UPDATE products
            SET
                name = $1,
                description = $2,
                price = $3,
                discount_price = $4,
                category_id = $5,
                brand_id = $6,
                stock = $7,
                is_on_sale = $8,
                is_active = $9
            WHERE id = $10
            RETURNING *;
        `;

        const productValues = [
            name,
            description || null,
            Number(price),
            discount_price === null || discount_price === ""
                ? null
                : Number(discount_price),
            Number(category_id),
            Number(brand_id),
            Number(stock) || 0,
            Boolean(is_on_sale),
            Boolean(is_active),
            id,
        ];

        const { rows: productRows } = await client.query(
            productQuery,
            productValues
        );

        if (productRows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // 2. Replace images
        await client.query(
            `
            DELETE FROM product_images
            WHERE product_id = $1;
            `,
            [id]
        );

        if (Array.isArray(images)) {
            for (const imageUrl of images) {
                if (!imageUrl) continue;

                await client.query(
                    `
                    INSERT INTO product_images (
                        product_id,
                        image_url
                    )
                    VALUES ($1, $2);
                    `,
                    [id, imageUrl]
                );
            }
        }

        // 3. Replace variants
        await client.query(
            `
            DELETE FROM product_variants
            WHERE product_id = $1;
            `,
            [id]
        );

        if (Array.isArray(variants)) {
            for (const variant of variants) {
                if (!variant.type || !variant.value) {
                    continue;
                }

                await client.query(
                    `
                    INSERT INTO product_variants (
                        product_id,
                        type,
                        value,
                        color_hex
                    )
                    VALUES ($1, $2, $3, $4);
                    `,
                    [
                        id,
                        variant.type,
                        variant.value,
                        variant.type === "color"
                            ? variant.color_hex || null
                            : null,
                    ]
                );
            }
        }

        await client.query("COMMIT");

        // 4. Return the complete updated product
        const updatedProductQuery = `
            SELECT
                p.id,
                p.name,
                p.category_id,
                p.brand_id,
                p.price,
                p.discount_price,
                p.stock,
                p.is_active,
                p.is_on_sale,
                p.description,
                p.created_at,
                c.name AS category_name,
                b.name AS brand_name,

                COALESCE(
                    json_agg(DISTINCT pi.image_url)
                    FILTER (
                        WHERE pi.image_url IS NOT NULL
                    ),
                    '[]'
                ) AS images,

                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', pv.id,
                            'type', pv.type,
                            'value', pv.value,
                            'color_hex', pv.color_hex
                        )
                    )
                    FILTER (
                        WHERE pv.id IS NOT NULL
                    ),
                    '[]'
                ) AS variants

            FROM products p

            LEFT JOIN categories c
                ON p.category_id = c.id

            LEFT JOIN brands b
                ON p.brand_id = b.id

            LEFT JOIN product_images pi
                ON p.id = pi.product_id

            LEFT JOIN product_variants pv
                ON p.id = pv.product_id

            WHERE p.id = $1

            GROUP BY p.id, c.name, b.name;
        `;

        const { rows: updatedRows } = await client.query(
            updatedProductQuery,
            [id]
        );

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedRows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Error updating product:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating product",
        });
    } finally {
        client.release();
    }
};