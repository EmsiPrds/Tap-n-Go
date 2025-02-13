const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_secret_key_here';  // Replace with your actual secret key

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');  // Expecting the token in the Authorization header

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;  // Attach admin info to request object
        next();  // Proceed to the next middleware or route
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

module.exports = verifyToken;
