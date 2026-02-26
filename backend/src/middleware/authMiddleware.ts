import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/auth.js";


export interface AuthRequest extends Request {
    userId?: number;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Access token required" });

    try {
        const { userId } = verifyAccessToken(token);
        req.userId = userId;
        next();
    } catch (error) {
        return res.status(403).json({ error: "Invalid or expired access token" });
    }
};
