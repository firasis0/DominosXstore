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

export const addCategory = async (req,res) => {
    const { name, image_url } = req.body;
    try{

        if(!name || !name.trim()){
            return res.status(400).json({
                success : false,
                message : "Category name is required."
            })
        }
        
        const queryText = `
        INSERT INTO categories 
        (name, image_url, is_active)
        VALUES (
        $1,
        $2,
        true
        )
        RETURNING id, name, image_url, is_active;
        `


        
        const response = await db.query(queryText,[
            name.trim(),
            image_url
        ])

        if(response.rows.length == 0){
            throw new Error(`Could not insert a new category.`)
        }

        const result = response.rows[0]

        return res.status(201).json({
            success : true,
            message : `Category inserted successfully.`,
            data : result
        })

    }catch(error){
        console.log(error)

        if(error.code === "23505"){
            return res.status(409).json({
                success : false,
                message : "A category with the same name already exists."
            })
        }

        return res.status(500).json({
            success : false,
            message : `Server error inserting categories : ${error}`
        })
    }
}

export const uploadCategoryImage = async (req,res) => {
    try{
        if(!req.file){
            return res.status(400).json({
                success : false,
                message : "No image was uploaded"
            })
        };

        const imageUrl = `/uploads/categories/${req.file.filename}`;

        return res.status(201).json({
            success: true,
            message: "Category image uploaded successfully.",
            data : {
                url : imageUrl,
            },
        });


    }catch(error){
        console.error(`Error uploading category image: ${error}`);

        return res.status(500).json({
            success: false,
            message: "Server error while uploading category image",
        })
    }
}

export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, image_url } = req.body;

    try {
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required."
            });
        }

        const queryText = `
            UPDATE categories
            SET
                name = $1,
                image_url = $2
            WHERE id = $3
            RETURNING id, name, image_url, is_active;
        `;

        const response = await db.query(queryText, [
            name.trim(),
            image_url || null,
            id
        ]);

        if (response.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Could not find the category."
            });
        }

        const result = response.rows[0];

        return res.status(200).json({
            success: true,
            message: "Category updated successfully.",
            data: result
        });

    } catch (error) {
        console.error("Error updating category:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "A category with the same name already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error while updating category."
        });
    }
};

export const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        // Check whether the category exists and how many products it has
        const checkQuery = `
            SELECT
                c.id,
                c.name,
                COUNT(p.id)::int AS product_count
            FROM categories c
            LEFT JOIN products p
                ON p.category_id = c.id
            WHERE c.id = $1
            GROUP BY c.id;
        `;

        const checkResult = await db.query(checkQuery, [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Could not find the category."
            });
        }

        const category = checkResult.rows[0];

        if (category.product_count > 0) {
            return res.status(409).json({
                success: false,
                message: "Cannot delete a category that contains products."
            });
        }

        const deleteQuery = `
            DELETE FROM categories
            WHERE id = $1
            RETURNING id, name;
        `;

        const deleteResult = await db.query(deleteQuery, [id]);

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully.",
            data: deleteResult.rows[0]
        });

    } catch (error) {
        console.error("Error deleting category:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deleting category."
        });
    }
};