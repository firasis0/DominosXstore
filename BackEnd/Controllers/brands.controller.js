import db from '../DB/db.js';

export const getBrands = async (req, res) => {
    try {
        const queryText = `
            SELECT
                b.id,
                b.name,
                b.image_url,
                b.is_active,
                COUNT(p.id)::int AS product_count,
                COUNT(p.id) FILTER (
                    WHERE p.is_active
                )::int AS active_product_count
            FROM brands b
            LEFT JOIN products p ON p.brand_id = b.id
            GROUP BY b.id
            ORDER BY b.name ASC;
        `;

        const response = await db.query(queryText);

        return res.status(200).json({
            success: true,
            message: 'Brands fetched correctly',
            data: response.rows
        });
    } catch (error) {
        console.error('Error fetching dashboard brands:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching brands'
        });
    }
};

export const toggleBrand = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
        return res.status(400).json({
            success: false,
            message: 'is_active must be a boolean.'
        });
    }

    let client;

    try {
        client = await db.connect();
        await client.query('BEGIN');

        const brandResult = await client.query(
            `UPDATE brands
             SET is_active = $1
             WHERE id = $2
             RETURNING id, name, image_url, is_active;`,
            [is_active, id]
        );

        if (brandResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Could not find the brand.'
            });
        }

        if (!is_active) {
            await client.query(
                `UPDATE products
                 SET is_active = false
                 WHERE brand_id = $1 AND is_active = true;`,
                [id]
            );
        }

        await client.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: `Brand ${is_active ? 'activated' : 'deactivated'} successfully.`,
            data: brandResult.rows[0]
        });
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Error toggling brand:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while updating brand status.'
        });
    } finally {
        if (client) client.release();
    }
};

export const addBrand = async (req, res) => {
    const { name, image_url } = req.body;

    try {
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Brand name is required.'
            });
        }

        const response = await db.query(
            `INSERT INTO brands (name, image_url, is_active)
             VALUES ($1, $2, true)
             RETURNING id, name, image_url, is_active;`,
            [name.trim(), image_url || null]
        );

        return res.status(201).json({
            success: true,
            message: 'Brand inserted successfully.',
            data: response.rows[0]
        });
    } catch (error) {
        console.error('Error inserting brand:', error);
        return res.status(error.code === '23505' ? 409 : 500).json({
            success: false,
            message: error.code === '23505'
                ? 'A brand with the same name already exists.'
                : 'Server error while inserting brand.'
        });
    }
};

export const updateBrand = async (req, res) => {
    const { id } = req.params;
    const { name, image_url } = req.body;

    try {
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Brand name is required.'
            });
        }

        const response = await db.query(
            `UPDATE brands
             SET name = $1, image_url = $2
             WHERE id = $3
             RETURNING id, name, image_url, is_active;`,
            [name.trim(), image_url || null, id]
        );

        if (response.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Could not find the brand.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Brand updated successfully.',
            data: response.rows[0]
        });
    } catch (error) {
        console.error('Error updating brand:', error);
        return res.status(error.code === '23505' ? 409 : 500).json({
            success: false,
            message: error.code === '23505'
                ? 'A brand with the same name already exists.'
                : 'Server error while updating brand.'
        });
    }
};

export const deleteBrand = async (req, res) => {
    const { id } = req.params;

    try {
        const checkResult = await db.query(
            `SELECT b.id, COUNT(p.id)::int AS product_count
             FROM brands b
             LEFT JOIN products p ON p.brand_id = b.id
             WHERE b.id = $1
             GROUP BY b.id;`,
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Could not find the brand.'
            });
        }

        if (checkResult.rows[0].product_count > 0) {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete a brand that contains products.'
            });
        }

        const deleteResult = await db.query(
            `DELETE FROM brands WHERE id = $1 RETURNING id, name;`,
            [id]
        );

        return res.status(200).json({
            success: true,
            message: 'Brand deleted successfully.',
            data: deleteResult.rows[0]
        });
    } catch (error) {
        console.error('Error deleting brand:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while deleting brand.'
        });
    }
};

export const uploadBrandImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No image was uploaded.'
        });
    }

    return res.status(201).json({
        success: true,
        message: 'Brand image uploaded successfully.',
        data: {
            url: `/uploads/brands/${req.file.filename}`
        }
    });
};