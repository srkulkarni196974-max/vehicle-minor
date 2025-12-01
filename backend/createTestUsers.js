// Create Test Users Script
// Run this with: node createTestUsers.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Model (simplified)
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createTestUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Hash password
        const hashedPassword = await bcrypt.hash('demo', 10);

        // Create test users
        const testUsers = [
            {
                name: 'Fleet Owner',
                email: 'owner@fleet.com',
                password: hashedPassword,
                role: 'fleet_owner',
                isVerified: true
            },
            {
                name: 'Test Driver',
                email: 'driver@fleet.com',
                password: hashedPassword,
                role: 'driver',
                isVerified: true
            },
            {
                name: 'Personal User',
                email: 'personal@user.com',
                password: hashedPassword,
                role: 'personal',
                isVerified: true
            }
        ];

        // Insert users (skip if already exist)
        for (const userData of testUsers) {
            try {
                const existing = await User.findOne({ email: userData.email });
                if (existing) {
                    console.log(`⚠️  User ${userData.email} already exists`);
                } else {
                    await User.create(userData);
                    console.log(`✅ Created user: ${userData.email}`);
                }
            } catch (err) {
                console.log(`❌ Error creating ${userData.email}:`, err.message);
            }
        }

        console.log('\n🎉 Done! You can now login with:');
        console.log('   Email: owner@fleet.com');
        console.log('   Password: demo');
        console.log('\n   OR');
        console.log('   Email: driver@fleet.com');
        console.log('   Password: demo');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createTestUsers();
