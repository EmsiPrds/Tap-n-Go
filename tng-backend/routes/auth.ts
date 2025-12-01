import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import {
  extractToken,
  verifyRefreshToken,
} from "../middleware/authMiddleware.js";
import Admin from "../models/Admin.js";
import { AuthRequest, JWTPayload } from "../types/index.js";

const router = express.Router();

// Configuration
const JWT_SECRET: string = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
const ACCESS_TOKEN_EXPIRY: StringValue = (process.env.JWT_EXPIRES_IN ||
  "15m") as StringValue;
const REFRESH_TOKEN_EXPIRY: StringValue = (process.env.JWT_REFRESH_EXPIRES_IN ||
  "7d") as StringValue;

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

// Rate limiting configuration
const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "5"), // 5 requests per window
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
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
    message: "Too many refresh requests. Please try again later.",
  },
});

/**
 * Generate JWT tokens
 */
const generateTokens = (
  adminId: string
): { accessToken: string; refreshToken: string } => {
  const payload: JWTPayload = { id: adminId };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
};

/**
 * Set secure cookies for tokens
 */
const setTokenCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "strict" : "lax") as "strict" | "lax",
  };

  // Access token cookie (15 minutes)
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  // Refresh token cookie (7 days)
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

/**
 * POST /api/auth/login
 * Admin login endpoint
 */
router.post(
  "/login",
  loginLimiter,
  [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-z0-9_]+$/)
      .withMessage(
        "Username can only contain lowercase letters, numbers, and underscores"
      ),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 3 })
      .withMessage("Password must be at least 3 characters"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Login attempt received:", {
        username: req.body.username,
        hasPassword: !!req.body.password,
      });

      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array().map((err) => ({
            field: err.type === "field" ? err.path : "unknown",
            message: err.msg,
          })),
        });
        return;
      }

      const { username, password } = req.body as {
        username: string;
        password: string;
      };
      const normalizedUsername = username.trim().toLowerCase();
      console.log("Normalized username:", normalizedUsername);

      // Find admin (include password and lock status)
      const admin = await Admin.findOne({
        username: normalizedUsername,
      }).select("+password +loginAttempts +lockUntil +isActive");

      // Check if account exists
      if (!admin) {
        // Use generic message to prevent username enumeration
        console.log(
          `Login attempt with non-existent username: ${normalizedUsername}`
        );
        res.status(401).json({
          success: false,
          message: "Invalid username or password",
        });
        return;
      }

      // Check if account is locked
      if (admin.isLocked) {
        const lockTime = Math.ceil(
          (admin.lockUntil!.getTime() - Date.now()) / 1000 / 60
        );
        res.status(423).json({
          success: false,
          message: `Account is temporarily locked. Please try again in ${lockTime} minutes.`,
        });
        return;
      }

      // Check if account is active
      if (!admin.isActive) {
        res.status(403).json({
          success: false,
          message: "Account is deactivated. Please contact administrator.",
        });
        return;
      }

      // Verify password
      console.log("Comparing password for admin:", normalizedUsername);
      const isPasswordValid = await admin.comparePassword(password);
      console.log("Password comparison result:", isPasswordValid);

      if (!isPasswordValid) {
        // Increment login attempts
        await admin.incLoginAttempts();

        console.log(
          `Failed login attempt for username: ${normalizedUsername} - Password mismatch`
        );
        res.status(401).json({
          success: false,
          message: "Invalid username or password",
        });
        return;
      }

      console.log("Login successful for username:", normalizedUsername);

      // Password is correct - reset login attempts and update last login
      await admin.resetLoginAttempts();
      admin.lastLogin = new Date();

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(
        admin._id.toString()
      );

      // Save refresh token to database
      admin.refreshToken = refreshToken;
      await admin.save();

      // Set secure cookies
      setTokenCookies(res, accessToken, refreshToken);

      // Return success response
      res.json({
        success: true,
        message: "Login successful",
        data: {
          accessToken,
          refreshToken,
          admin: {
            id: admin._id,
            username: admin.username,
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred during login. Please try again later.",
      });
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  "/refresh",
  refreshLimiter,
  verifyRefreshToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Generate new access token
      const { accessToken } = generateTokens(req.admin!.id);

      // Update access token cookie
      const isProduction = process.env.NODE_ENV === "production";
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: (isProduction ? "strict" : "lax") as "strict" | "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken,
        },
      });
    } catch (error) {
      console.error("Refresh token error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while refreshing token.",
      });
    }
  }
);

/**
 * POST /api/auth/logout
 * Logout and invalidate refresh token
 */
router.post(
  "/logout",
  verifyRefreshToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Clear refresh token from database
      await Admin.findByIdAndUpdate(req.admin!.id, {
        $unset: { refreshToken: 1 },
      });

      // Clear cookies
      const isProduction = process.env.NODE_ENV === "production";
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
      });
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
      });

      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred during logout.",
      });
    }
  }
);

/**
 * GET /api/auth/verify
 * Verify token validity and return admin info
 */
router.get("/verify", async (req: Request, res: Response): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "No token provided",
      });
      return;
    }

    // Verify token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }

    // Get admin info
    const admin = await Admin.findById(decoded.id).select("username isActive");

    if (!admin || !admin.isActive) {
      res.status(401).json({
        success: false,
        message: "Invalid token or account deactivated",
      });
      return;
    }

    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id.toString(),
          username: admin.username,
        },
      },
    });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({
      success: false,
      message: "Token verification failed",
    });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated admin info
 */
router.get("/me", async (req: Request, res: Response): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }

    const admin = await Admin.findById(decoded.id).select(
      "username lastLogin createdAt"
    );

    if (!admin) {
      res.status(404).json({
        success: false,
        message: "Admin not found",
      });
      return;
    }

    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          lastLogin: admin.lastLogin,
          createdAt: admin.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Get admin info error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve admin information",
    });
  }
});

export default router;
