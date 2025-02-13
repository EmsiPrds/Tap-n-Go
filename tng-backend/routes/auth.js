const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const router = express.Router();  // Initialize the router here

// Admin Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });  // Debug log

    try {
        const admin = await Admin.findOne({ username });
        console.log('Admin from DB:', admin);  // Debug log

        if (!admin) {
            console.log('Admin not found');
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        console.log('Password match:', isMatch);  // Debug log

        if (!isMatch) {
            console.log('Password mismatch');
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: admin._id }, 'your_secret_key_here', { expiresIn: '1d' });
        res.json({ token });
    } catch (err) {
        console.log('Server error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;  // Export the router
