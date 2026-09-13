import db from '../DB/db.js';

export const getCategories = async (req,res) => {
    try{
        const queryText = `
        SELECT 
            c.id,
            c.name,
            c.image_url,
            c.is_active,

            COUNT(p.id)::int AS product_count,
            COUNT(p.id) FILTER (
            WHERE p.is_active)::int AS active_product_count
            FROM categories c
            LEFT JOIN products p 
                ON p.category_id = c.id
            GROUP BY 
                c.id
            ORDER BY c.name ASC
        ;`;

        const response = await db.query(queryText);

        const result =  response.rows;
         res.status(200).json({
            success : true,
            message : 'Categories Fetched correctly',
            data : result
         })
    }catch(error){
        console.log('Error fetching dashboard categories');
        res.status(500).json({
            success : false,
            message : 'Server Error while fetching categories'
        })
    }
}

export const toggleCategory = async (req,res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    let client;
    try {
        
        if(typeof is_active !== 'boolean'){
           return res.status(400).json({
                success : false,
                message : 'The is_Active must be a BOOLEAN !'
            })
        }

        if(is_active){
            const activateQueryText = `
        UPDATE categories
        SET is_active = true
        WHERE id = $1
        RETURNING id, name, is_active;
        `
            const { rows } =  await db.query(activateQueryText,[id])
            

            if(rows.length === 0){
              return res.status(404).json({
                    success : false,
                    message: 'Could not find the category',
                })
            }
            
              return res.status(200).json({
                    success: true,
                    message: "The category activated !",
                    data : rows[0]
                })
            
        }

        //Deactivate queries : 
        const deactivateQueryText = `
        UPDATE categories
        SET is_active = false
        WHERE id = $1
        RETURNING id, name, is_active;
        `
        const deactivateProductQueryText = `
        UPDATE products
        SET is_active = false
        WHERE category_id = $1
        AND is_active = true
        RETURNING id;
        `

     client = await db.connect();

       await client.query("BEGIN");
     const categoryResult = await client.query(deactivateQueryText,[id]);

    if(categoryResult.rows.length === 0){
        await client.query("ROLLBACK");
       return res.status(404).json({
            success : false,
            message : 'Could not find the Category'
        })
    }

     const productsResult = await client.query(deactivateProductQueryText,[id]);
       await client.query("COMMIT");

   

    return res.status(200).json({
        success : true,
        message : 'Category Deactivated correctly !',
        data : {
            category : categoryResult.rows[0],
            affected_products : productsResult.rowCount
        } 
    });

        
    }catch(error){
        console.log(error);
        
        if(client){
            await client.query("ROLLBACK");
        }
        return res.status(500).json({
            success : false,
            message : 'Server error while deactivating category'
        })
    }finally {
        if(client){
            client.release();
        }
    }
}