import authMiddleware from "./auth.middleware.js";

export default function dashboardAuthMiddleware(req, res, next) {
    if(req.path.startsWith("/dashboard")) {
        return authMiddleware(req, res, next);
    }

    next();
}