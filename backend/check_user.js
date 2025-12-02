require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        const user = await User.findOne({ email: 'srkulkarni1969.74@gmail.com' });

        if (user) {
            console.log('✅ User found:');
            console.log('  - Name:', user.name);
            console.log('  - Email:', user.email);
            console.log('  - Role:', user.role);
            console.log('  - Is Verified:', user.isVerified);
            console.log('  - Is Active:', user.isActive);
        } else {
            console.log('❌ User NOT found with email: srkulkarni1969.74@gmail.com');
        }

        process.exit(0);
    })
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });
