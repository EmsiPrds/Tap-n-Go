// authMiddleware.js
import jwt from 'jsonwebtoken';  // Default import for CommonJS modules

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Access verify method from jwt
        req.admin = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

export default verifyToken;
