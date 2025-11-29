import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { AuthRequest, JWTPayload } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

/**
 * Extract token from request
 * Checks Authorization header (Bearer token) or cookies
 */
export const extractToken = (req: Request): string | null => {
    // Check Authorization header
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    
    // Fallback to cookie
    return (req.cookies?.accessToken as string) || null;
};

/**
 * Verify JWT access token middleware
 * Attaches admin info to req.admin on success
 */
export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = extractToken(req);

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authentication required. No token provided.'
            });
            return;
        }

        // Verify token
        let decoded: JWTPayload;
        try {
            decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        } catch (jwtError) {
            if (jwtError instanceof Error && jwtError.name === 'TokenExpiredError') {
                res.status(401).json({
                    success: false,
                    message: 'Token expired. Please refresh your token.',
                    code: 'TOKEN_EXPIRED'
                });
                return;
            } else if (jwtError instanceof Error && jwtError.name === 'JsonWebTokenError') {
                res.status(401).json({
                    success: false,
                    message: 'Invalid token.',
                    code: 'INVALID_TOKEN'
                });
                return;
            }
            throw jwtError;
        }

        // Verify admin still exists and is active
        const admin = await Admin.findById(decoded.id).select('username isActive');
        if (!admin) {
            res.status(401).json({
                success: false,
                message: 'Invalid token. Admin not found.'
            });
            return;
        }

        if (!admin.isActive) {
            res.status(403).json({
                success: false,
                message: 'Account is deactivated.'
            });
            return;
        }

        // Attach admin info to request
        req.admin = {
            id: admin._id.toString(),
            username: admin.username
        };

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed.'
        });
    }
};

/**
 * Verify refresh token middleware
 * Used for refresh and logout endpoints
 */
export const verifyRefreshToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const refreshToken = (req.body.refreshToken as string) || (req.cookies?.refreshToken as string);

        if (!refreshToken) {
            res.status(401).json({
                success: false,
                message: 'Refresh token required.'
            });
            return;
        }

        // Verify token
        let decoded: JWTPayload;
        try {
            decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET!) as JWTPayload;
        } catch (jwtError) {
            if (jwtError instanceof Error && jwtError.name === 'TokenExpiredError') {
                res.status(401).json({
                    success: false,
                    message: 'Refresh token expired. Please login again.',
                    code: 'REFRESH_TOKEN_EXPIRED'
                });
                return;
            }
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token.'
            });
            return;
        }

        // Verify token exists in database and matches
        const admin = await Admin.findById(decoded.id)
            .select('+refreshToken username isActive');

        if (!admin) {
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token. Admin not found.'
            });
            return;
        }

        if (!admin.isActive) {
            res.status(403).json({
                success: false,
                message: 'Account is deactivated.'
            });
            return;
        }

        if (admin.refreshToken !== refreshToken) {
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token. Token mismatch.'
            });
            return;
        }

        // Attach admin info to request
        req.admin = {
            id: admin._id.toString(),
            username: admin.username
        };
        req.refreshToken = refreshToken;

        next();
    } catch (error) {
        console.error('Refresh token verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Refresh token verification failed.'
        });
    }
};

