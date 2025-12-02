const admin = require('../config/firebase');
const User = require('../models/User');

module.exports = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return async (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Access Denied. No token provided.' });
        }

        try {
            // Verify Firebase ID Token
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = decodedToken;

            // Find user in MongoDB to get role and internal ID
            const user = await User.findOne({ email: decodedToken.email });

            if (!user) {
                return res.status(401).json({ message: 'User not registered in system.' });
            }

            // Attach MongoDB user details to request
            req.user.id = user._id;
            req.user.role = user.role;
            req.user.mongoUser = user;

            if (roles.length && !roles.includes(user.role)) {
                return res.status(403).json({ message: 'Access Denied. Insufficient permissions.' });
            }

            next();
        } catch (error) {
            console.error('Auth Middleware Error:', error);
            res.status(401).json({ message: 'Invalid or Expired Token' });
        }
    };
};
