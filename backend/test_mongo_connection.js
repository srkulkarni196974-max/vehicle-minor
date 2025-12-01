require('dotenv').config();
const mongoose = require('mongoose');

console.log('=== MongoDB Connection Diagnostic ===\n');

// Check if MONGO_URI exists
if (!process.env.MONGO_URI) {
    console.error('❌ ERROR: MONGO_URI is not defined in .env file');
    console.log('\nPlease add MONGO_URI to your .env file:');
    console.log('MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority');
    process.exit(1);
}

// Mask the password in the URI for security
const maskedUri = process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@');
console.log('✓ MONGO_URI found in .env');
console.log(`  Connection string: ${maskedUri}\n`);

// Check other required environment variables
const requiredVars = ['JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
requiredVars.forEach(varName => {
    if (!process.env[varName]) {
        console.warn(`⚠️  WARNING: ${varName} is not defined in .env file`);
    } else {
        console.log(`✓ ${varName} is defined`);
    }
});

console.log('\n=== Attempting MongoDB Connection ===\n');

// Attempt connection with detailed error handling
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000, // 10 second timeout
})
    .then(() => {
        console.log('✅ SUCCESS: MongoDB Connected!');
        console.log(`   Database: ${mongoose.connection.name}`);
        console.log(`   Host: ${mongoose.connection.host}`);
        console.log(`   Port: ${mongoose.connection.port}`);

        // Close connection and exit
        mongoose.connection.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ FAILED: MongoDB Connection Error\n');

        // Provide specific error guidance
        if (err.message.includes('ENOTFOUND')) {
            console.error('Issue: DNS resolution failed - cannot find MongoDB server');
            console.error('Solution: Check your MONGO_URI hostname is correct');
        } else if (err.message.includes('authentication failed')) {
            console.error('Issue: Authentication failed');
            console.error('Solution: Check your MongoDB username and password in MONGO_URI');
        } else if (err.message.includes('ETIMEDOUT') || err.message.includes('ECONNREFUSED')) {
            console.error('Issue: Connection timeout or refused');
            console.error('Solution: Check if:');
            console.error('  1. Your IP address is whitelisted in MongoDB Atlas');
            console.error('  2. Your network allows outbound connections to MongoDB');
        } else if (err.message.includes('bad auth')) {
            console.error('Issue: Invalid credentials');
            console.error('Solution: Verify username/password in MongoDB Atlas');
        } else {
            console.error('Error details:', err.message);
        }

        console.error('\nFull error:', err);
        process.exit(1);
    });
