
import bcrypt from 'bcrypt';
import pool from '../DB/db.js';

const email = 'frsmeftahi@gmail.com';
const password = 'Kenfii@2003';

async function createAdmin () {
    try{
        const passwordHash = await bcrypt.hash(password,12);

        const existingAdmin = await pool.query(`
            SELECT id FROM admin_users WHERE email = $1`,[email]);

        if(existingAdmin.rows.length > 0){
            console.log(`Admin already Exists: ${email}`);
            return;
        }

    const result = await pool.query(
        `
        INSERT INTO admin_users (email, password_hash, is_active)
        values ($1, $2, true)
        RETURNING id, email, is_active, created_at
        `,
        [email, passwordHash]
    );

    console.log('Admin created successfully : ')
    console.log(result.rows[0]);
    }catch(error){
        console.error("Faild to create admin : ", error);
    }finally{
        await pool.end();
    }
}

createAdmin();