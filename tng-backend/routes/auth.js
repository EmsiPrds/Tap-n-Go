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
