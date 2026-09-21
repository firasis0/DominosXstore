import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../DB/db.js';

export async function login (req, res) {
    try{
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(400).json({
                message: "Email and password are required.",
            });
        }

        const result = await pool.query(
            `
            SELECT id, email, password_hash, is_active
            FROM admin_users
            WHERE email = $1
            `,
            [email.trim().toLowerCase()]
        )

        if(result.rows.length === 0){
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const admin = result.rows[0];

        if(!admin.is_active) {
            return res.status(403).json({
                message: "This account is disabled"
            })
        }

        const passwordMatches = await bcrypt.compare(
            password,
            admin.password_hash
        );

        if(!passwordMatches) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            })
        }

        if(!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured.");

            return res.status(500).json({
                message: "Authentication configuration error."
            })
        }

        const token = jwt.sign(
            {
                adminId: admin.id,
                email: admin.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        )

        return res.status(200).json({
            message: "Login successfull.",
            token,
            admin: {
                id: admin.id,
                email: admin.email,
            }
        })
    }catch(error){
        console.error("Failed to Athenticate : ", error);

        return res.status(500).json({
            message: "Internal server error."
        })
    }
}