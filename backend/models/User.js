const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
        type: String,
        enum: ['admin', 'fleet_owner', 'driver', 'personal'],
        default: 'personal'
    },
    isVerified: { type: Boolean, default: true }, // Firebase handles verification
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
