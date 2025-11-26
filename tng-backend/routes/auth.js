<<<<<<< HEAD
const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { verifyRefreshToken, extractToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Configuration
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

// Rate limiting configuration
const loginLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5, // 5 requests per window
    message: {
        success: false,
        message: 'Too many login attempts. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
});

const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 refresh requests per window
    message: {
        success: false,
        message: 'Too many refresh requests. Please try again later.'
    }
});

/**
 * Generate JWT tokens
 */
const generateTokens = (adminId) => {
    const payload = { id: adminId };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY
    });

    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY
    });

    return { accessToken, refreshToken };
};

/**
 * Set secure cookies for tokens
 */
const setTokenCookies = (res, accessToken, refreshToken) => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
    };

    // Access token cookie (15 minutes)
    res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000
    });

    // Refresh token cookie (7 days)
    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

/**
 * POST /api/auth/login
 * Admin login endpoint
 */
router.post('/login',
    loginLimiter,
    [
        body('username')
            .trim()
            .notEmpty().withMessage('Username is required')
            .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
            .matches(/^[a-z0-9_]+$/).withMessage('Username can only contain lowercase letters, numbers, and underscores'),
        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 3 }).withMessage('Password must be at least 3 characters')
    ],
    async (req, res) => {
        try {
            console.log('Login attempt received:', { 
                username: req.body.username, 
                hasPassword: !!req.body.password 
            });
            
            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('Validation errors:', errors.array());
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array().map(err => ({
                        field: err.path,
                        message: err.msg
                    }))
                });
            }

            const { username, password } = req.body;
            const normalizedUsername = username.trim().toLowerCase();
            console.log('Normalized username:', normalizedUsername);

            // Find admin (include password and lock status)
            const admin = await Admin.findOne({ username: normalizedUsername })
                .select('+password +loginAttempts +lockUntil +isActive');

            // Check if account exists
            if (!admin) {
                // Use generic message to prevent username enumeration
                console.log(`Login attempt with non-existent username: ${normalizedUsername}`);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
            }

            // Check if account is locked
            if (admin.isLocked) {
                const lockTime = Math.ceil((admin.lockUntil - Date.now()) / 1000 / 60);
                return res.status(423).json({
                    success: false,
                    message: `Account is temporarily locked. Please try again in ${lockTime} minutes.`
                });
            }

            // Check if account is active
            if (!admin.isActive) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is deactivated. Please contact administrator.'
                });
            }

            // Verify password
            console.log('Comparing password for admin:', normalizedUsername);
            const isPasswordValid = await admin.comparePassword(password);
            console.log('Password comparison result:', isPasswordValid);
            
            if (!isPasswordValid) {
                // Increment login attempts
                await admin.incLoginAttempts();
                
                console.log(`Failed login attempt for username: ${normalizedUsername} - Password mismatch`);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
            }
            
            console.log('Login successful for username:', normalizedUsername);

            // Password is correct - reset login attempts and update last login
            await admin.resetLoginAttempts();
            admin.lastLogin = new Date();
            
            // Generate tokens
            const { accessToken, refreshToken } = generateTokens(admin._id);
            
            // Save refresh token to database
            admin.refreshToken = refreshToken;
            await admin.save();

            // Set secure cookies
            setTokenCookies(res, accessToken, refreshToken);

            // Return success response
            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    accessToken,
                    refreshToken,
                    admin: {
                        id: admin._id,
                        username: admin.username
                    }
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred during login. Please try again later.'
            });
        }
    }
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh',
    refreshLimiter,
    verifyRefreshToken,
    async (req, res) => {
        try {
            // Generate new access token
            const { accessToken } = generateTokens(req.admin.id);

            // Update access token cookie
            const isProduction = process.env.NODE_ENV === 'production';
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? 'strict' : 'lax',
                maxAge: 15 * 60 * 1000 // 15 minutes
            });

            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken
                }
            });
        } catch (error) {
            console.error('Refresh token error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while refreshing token.'
            });
        }
    }
);

/**
 * POST /api/auth/logout
 * Logout and invalidate refresh token
 */
router.post('/logout',
    verifyRefreshToken,
    async (req, res) => {
        try {
            // Clear refresh token from database
            await Admin.findByIdAndUpdate(req.admin.id, {
                $unset: { refreshToken: 1 }
            });

            // Clear cookies
            res.clearCookie('accessToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            res.json({
                success: true,
                message: 'Logout successful'
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred during logout.'
            });
        }
    }
);

/**
 * GET /api/auth/verify
 * Verify token validity and return admin info
 */
router.get('/verify', async (req, res) => {
    try {
        const token = extractToken(req);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Get admin info
        const admin = await Admin.findById(decoded.id).select('username isActive');
        
        if (!admin || !admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or account deactivated'
            });
        }

        res.json({
            success: true,
            data: {
                admin: {
                    id: admin._id,
                    username: admin.username
                }
            }
        });
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({
            success: false,
            message: 'Token verification failed'
        });
    }
});

/**
 * GET /api/auth/me
 * Get current authenticated admin info
 */
router.get('/me', async (req, res) => {
    try {
        const token = extractToken(req);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        const admin = await Admin.findById(decoded.id).select('username lastLogin createdAt');
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.json({
            success: true,
            data: {
                admin: {
                    id: admin._id,
                    username: admin.username,
                    lastLogin: admin.lastLogin,
                    createdAt: admin.createdAt
                }
            }
        });
    } catch (error) {
        console.error('Get admin info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve admin information'
        });
    }
});

module.exports = router;
=======
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Admin from "../models/Admin.js"; // Ensure the correct path and `.js` extension

dotenv.config(); // Load environment variables

const router = express.Router();

// Admin Login Route
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    console.log("Login attempt:", { username });

    try {
        // Find admin by username
        const admin = await Admin.findOne({ username });
        console.log("Admin from DB:", admin);

        if (!admin) {
            console.log("Admin not found");
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, admin.password);
        console.log("Password match:", isMatch);

        if (!isMatch) {
            console.log("Password mismatch");
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json({ token });
    } catch (err) {
        console.error("Server error:", err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

export default router; // Export the router correctly
>>>>>>> d16eb7d84847a594d3ae5d1a73e4ecd32720bd00
