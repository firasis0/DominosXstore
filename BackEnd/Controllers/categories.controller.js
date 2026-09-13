import db from '../DB/db.js';

export const getCategories = async (req,res) => {
    try{
        const queryText = `
        SELECT 
            c.id,
            c.name,
            c.image_url,
            c.is_active
            from categories c;
        `

        const response = await db.query(queryText);

        if(response.rows.length === 0 ){
            res.status(404).json({
                success : false,
                message : 'There is no category found'
            })
        }

        const result = await response.rows;
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