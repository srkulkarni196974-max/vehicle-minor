const User = require('../models/User');
const admin = require('../config/firebase');

// Sync User with Firebase (Login/Register)
exports.syncUser = async (req, res) => {
    try {
        const { name, email, role, firebaseUid } = req.body;

        // The token is already verified by middleware if this route is protected,
        // but for initial sync we might want to verify explicitly or rely on middleware.
        // Let's assume this endpoint is protected by authMiddleware, so req.user is populated from the token.
        // However, for the *first* creation, the user might not exist in MongoDB yet, 
        // which would cause the middleware to fail if it strictly checks for MongoDB user.
        // So this endpoint should probably be OPEN or have a special middleware that only verifies the token validity.

        // Actually, let's make this endpoint verify the token manually to avoid the middleware "User not found" catch-22.
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const decodedToken = await admin.auth().verifyIdToken(token);
        const requestEmail = decodedToken.email;

        if (email !== requestEmail) {
            return res.status(403).json({ message: 'Token email does not match request body' });
        }

        let user = await User.findOne({ email });

        if (user) {
            // Update existing user if needed
            // user.name = name || user.name; // Optional update
            // await user.save();
            console.log('✅ User logged in:', email);
        } else {
            // Create new user
            if (!role) {
                return res.status(400).json({ message: 'Role is required for new registration' });
            }

            user = new User({
                name: name || decodedToken.name || 'User',
                email,
                role,
                isVerified: true, // Firebase handles verification
                isActive: true
            });
            await user.save();
            console.log('🎉 New user registered:', email);
        }

        // Check for driver assignment
        let assignedVehicleId = null;
        if (user.role === 'driver') {
            const Driver = require('../models/Driver');
            const Vehicle = require('../models/Vehicle');
            const driverProfile = await Driver.findOne({ userId: user._id });
            if (driverProfile) {
                const vehicle = await Vehicle.findOne({ currentDriver: driverProfile._id });
                if (vehicle) {
                    assignedVehicleId = vehicle._id;
                }
            }
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                assignedVehicleId
            }
        });

    } catch (error) {
        console.error('Sync User Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        // req.user is set by authMiddleware (which fetches from MongoDB)
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let assignedVehicleId = null;
        if (user.role === 'driver') {
            const Driver = require('../models/Driver');
            const Vehicle = require('../models/Vehicle');
            const driverProfile = await Driver.findOne({ userId: user._id });
            if (driverProfile) {
                const vehicle = await Vehicle.findOne({ currentDriver: driverProfile._id });
                if (vehicle) assignedVehicleId = vehicle._id;
            }
        }

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            assignedVehicleId
        });
    } catch (error) {
        console.error('Get Me Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

