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
        json_agg(DISTINCT jsonb_build_object('id', pv.id, 'type', pv.type, 'value', pv.value)) 
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
            seccess: false,
            message: 'Server error while fetching products'
        })
    }
}