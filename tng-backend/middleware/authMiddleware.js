import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

/**
 * Extract token from request
 * Checks Authorization header (Bearer token) or cookies
 */
export const extractToken = (req) => {
    // Check Authorization header
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    
    // Fallback to cookie
    return req.cookies?.accessToken || null;
};

/**
 * Verify JWT access token middleware
 * Attaches admin info to req.admin on success
 */
export const verifyToken = async (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. No token provided.'
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired. Please refresh your token.',
                    code: 'TOKEN_EXPIRED'
                });
            } else if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token.',
                    code: 'INVALID_TOKEN'
                });
            }
            throw jwtError;
        }

        // Verify admin still exists and is active
        const admin = await Admin.findById(decoded.id).select('username isActive');
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Admin not found.'
            });
        }

        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated.'
            });
        }

        // Attach admin info to request
        req.admin = {
            id: admin._id.toString(),
            username: admin.username
        };

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed.'
        });
    }
};

/**
 * Verify refresh token middleware
 * Used for refresh and logout endpoints
 */
export const verifyRefreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required.'
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token expired. Please login again.',
                    code: 'REFRESH_TOKEN_EXPIRED'
                });
            }
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token.'
            });
        }

        // Verify token exists in database and matches
        const admin = await Admin.findById(decoded.id)
            .select('+refreshToken username isActive');

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token. Admin not found.'
            });
        }

        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated.'
            });
        }

        if (admin.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token. Token mismatch.'
            });
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
        return res.status(500).json({
            success: false,
            message: 'Refresh token verification failed.'
        });
    }
};
