import db from '../DB/db.js';
import {
    getProductsWithVariants,
    normalizeVariantPayload,
    saveProductVariants,
    syncProductSummary,
} from '../Services/productVariants.service.js';

//Dahboard Products Logic :

//Fetching the products :
export const getDashboardProducts = async (req,res) => {
    try{
        const rows = await getProductsWithVariants(db);

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
    let client;
    let categoryResult;
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
        RETURNING id, category_id, brand_id, is_active;
        `;

        
        const categoryDeactivateQueryText = `
        UPDATE categories
        SET is_active = true
        WHERE id = $1
        AND is_active = false
        RETURNING id, is_active;
        `

        const brandActivateQueryText = `
        UPDATE brands
        SET is_active = true
        WHERE id = $1
        AND is_active = false
        RETURNING id, is_active;
        `;
        

        client = await db.connect();
        await client.query("BEGIN");
        const  productResult  = await client.query(queryText, [
            is_active,
            id
        ]);

        if (productResult.rows.length === 0 ){
            await  client.query("ROLLBACK");
            return res.status(404).json({
                success : false,
                message : 'Product not found'
            });
        }

        let brandResult;

        if(is_active){
            categoryResult = await client.query(
                categoryDeactivateQueryText,
                [productResult.rows[0].category_id]
            );

            brandResult = await client.query(
                brandActivateQueryText,
                [productResult.rows[0].brand_id]
            );
        }

       await client.query("COMMIT")

        

        res.status(200).json({
            success : true,
            message : 'Product active status updated',
            data : {
                product : 
                {
                    is_active : productResult.rows[0].is_active,
                    id : productResult.rows[0].id
                },
                category : 
                categoryResult && categoryResult.rows.length > 0
                ? {
                    is_active : categoryResult.rows[0].is_active,
                    id : categoryResult.rows[0].id
                }
                : null
                ,brand :
                brandResult && brandResult.rows.length > 0
                ? {
                    is_active : brandResult.rows[0].is_active,
                    id : brandResult.rows[0].id
                }
                : null
            }
        })
    }catch(error){
        console.error('Error updating product active status', error)
        
        if(client){
            await client.query("ROLLBACK");
        }

        res.status(500).json({
            success : false,
            message : 'Server error while updating product'
        })
    }finally{
       if(client){
         client.release();
       }
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
// Stock, price and discount_price are NOT taken from the body: they are
// calculated from the variants (skus) by syncProductSummary().
export const createProduct = async (req, res) => {
    const client = await db.connect();

    try {
        const {
            name,
            description,
            category_id,
            brand_id,
            is_on_sale,
            is_active,
            images,
            variants,
            skus
        } = req.body;

        if (!name || category_id === undefined || brand_id === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Name, category and brand are required'
            });
        }

        const variantPayload = normalizeVariantPayload({
            variants,
            skus,
            images,
            isOnSale: Boolean(is_on_sale)
        });

        await client.query('BEGIN');

        // 1. Product (price / stock are filled in by syncProductSummary below)
        const { rows: productRows } = await client.query(
            `
            INSERT INTO products (
                name, description, price, category_id, brand_id,
                stock, is_on_sale, is_active
            )
            VALUES ($1, $2, 0, $3, $4, 0, false, $5)
            RETURNING id;
            `,
            [
                name,
                description || null,
                Number(category_id),
                Number(brand_id),
                Boolean(is_active)
            ]
        );

        const productId = productRows[0].id;

        // 2. Images
        if (Array.isArray(images)) {
            for (const imageUrl of images) {
                if (!imageUrl) continue;

                await client.query(
                    `INSERT INTO product_images (product_id, image_url) VALUES ($1, $2);`,
                    [productId, imageUrl]
                );
            }
        }

        // 3. Options + combinations, then total stock / starting price
        await saveProductVariants(client, productId, variantPayload);
        await syncProductSummary(client, productId, Boolean(is_on_sale));

        await client.query('COMMIT');

        const [created] = await getProductsWithVariants(db, { productId });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: created
        });

    } catch (error) {
        await client.query('ROLLBACK');

        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }

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
export const updateProduct = async (req, res) => {
    const client = await db.connect();

    try {
        const { id } = req.params;

        const {
            name,
            description,
            category_id,
            brand_id,
            is_on_sale,
            is_active,
            images,
            variants,
            skus
        } = req.body;

        if (!name || category_id === undefined || brand_id === undefined) {
            return res.status(400).json({
                success: false,
                message: "Name, category and brand are required",
            });
        }

        const variantPayload = normalizeVariantPayload({
            variants,
            skus,
            images,
            isOnSale: Boolean(is_on_sale)
        });

        await client.query("BEGIN");

        // 1. Product (this also locks the row, so orders wait for the save)
        const { rows: productRows } = await client.query(
            `
            UPDATE products
            SET
                name = $1,
                description = $2,
                category_id = $3,
                brand_id = $4,
                is_active = $5
            WHERE id = $6
            RETURNING id;
            `,
            [
                name,
                description || null,
                Number(category_id),
                Number(brand_id),
                Boolean(is_active),
                id,
            ]
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
            `DELETE FROM product_images WHERE product_id = $1;`,
            [id]
        );

        if (Array.isArray(images)) {
            for (const imageUrl of images) {
                if (!imageUrl) continue;

                await client.query(
                    `INSERT INTO product_images (product_id, image_url) VALUES ($1, $2);`,
                    [id, imageUrl]
                );
            }
        }

        // 3. Options + combinations, then total stock / starting price
        await saveProductVariants(client, id, variantPayload);
        await syncProductSummary(client, id, Boolean(is_on_sale));

        await client.query("COMMIT");

        const [updated] = await getProductsWithVariants(db, {
            productId: Number(id),
        });

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updated,
        });
    } catch (error) {
        await client.query("ROLLBACK");

        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }

        console.error("Error updating product:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating product",
        });
    } finally {
        client.release();
    }
};

//StoreFront products Logic :

//Fetching products :
export const getStoreProducts = async (req,res) => {
    try{
        const rows = await getProductsWithVariants(db, { onlyActive: true });

        return res.status(200).json({
            success : true,
            data : rows
        })
    }catch(error) {
        console.error('Error fetching store products', error)

        return res.status(500).json({
            success : false,
            message : 'Server error while fetching products'
        })
    }
}
