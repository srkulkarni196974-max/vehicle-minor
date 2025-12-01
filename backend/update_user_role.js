const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const updateUserRole = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'tejassutrave@gmail.com';
        const newRole = 'fleet_owner'; // or 'personal'

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User with email ${email} not found.`);
            return;
        }

        console.log(`Found user: ${user.name}, Current Role: ${user.role}`);

        user.role = newRole;
        await user.save();

        console.log(`Successfully updated user role to ${newRole}`);

    } catch (error) {
        console.error('Error updating user role:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

updateUserRole();
