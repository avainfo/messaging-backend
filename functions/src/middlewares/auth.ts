import { Request, Response, NextFunction } from "express";
import * as admin from "firebase-admin";

// Extend Express Request types to include the decoded user token
declare global {
    namespace Express {
        interface Request {
            user?: admin.auth.DecodedIdToken;
        }
    }
}

/**
 * Middleware that verifies the Firebase ID Token in the Authorization header.
 * If valid, attaches the decoded token to req.user.
 * If invalid or missing, returns 401/403.
 */
export const validateFirebaseIdToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Check if Authorization header exists
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Unauthorized",
            message: "No token provided. Please include 'Authorization: Bearer <token>' header.",
        });
    }

    const token = authHeader.split("Bearer ")[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Error verifying Firebase ID token:", error);
        return res.status(403).json({
            error: "Forbidden",
            message: "Invalid or expired token.",
        });
    }
};
