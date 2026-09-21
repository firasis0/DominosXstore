import jwt from "jsonwebtoken";
import dotenv from 'dotenv'

export default function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: 'Authentication require.',
            });
        }

        const token = authHeader.split(" ")[1];

        if(!token) {
            return res.status(401).json({
                message: "Authentication required.",
            })
        }

        if(!process.env.JWT_SECRET){
            console.error("JWT_SECRET is not configured.");

            return res.status(500).json({
                message: "Authentication configuration error.",
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.admin = {
            id : decoded.adminId,
            email : decoded.email,
        }

        next();

    }catch(error){
        
        if(error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Session Expired."
            });
        }
        
        if(error.name === "JsonWebTokenError"){
            return res.status(401).json({
                message: "Invalid authentication token.",
            })
        }
        
        console.error("Authentication Middleware error : ",error);

        return res.status(500).json({
            message: "Internal Server Authentication Error.",
        })
    }
}