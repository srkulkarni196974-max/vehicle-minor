const fs = require('fs');
const path = require('path');

console.log('=== Vehicle Management System - Environment Setup ===\n');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

// Check if .env exists
if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found!');
    console.log('Creating .env file from .env.example...\n');

    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Created .env file');
        console.log('⚠️  Please edit the .env file and add your MongoDB connection string\n');
    } else {
        console.log('❌ .env.example not found either!');
        console.log('Creating a basic .env file...\n');

        const basicEnv = `PORT=5000

# MongoDB Connection String
# Get this from MongoDB Atlas: https://cloud.mongodb.com/
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/vehicle_db?retryWrites=true&w=majority

# JWT Secret (generate a random string)
JWT_SECRET=${require('crypto').randomBytes(32).toString('hex')}

# Email Configuration (for OTP and notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Node Environment
NODE_ENV=development
`;

        fs.writeFileSync(envPath, basicEnv);
        console.log('✅ Created basic .env file with random JWT_SECRET');
    }

    console.log('\n📝 Next Steps:');
    console.log('1. Open backend\\.env file');
    console.log('2. Replace MONGO_URI with your actual MongoDB connection string');
    console.log('3. (Optional) Add EMAIL_USER and EMAIL_PASS for email features');
    console.log('4. Run: node test_mongo_connection.js');
    console.log('5. Run: npm run dev\n');

} else {
    console.log('✅ .env file exists');

    // Read and check for required variables
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    const config = {};
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                config[key.trim()] = valueParts.join('=').trim();
            }
        }
    });

    console.log('\n📋 Environment Variables Status:\n');

    const requiredVars = {
        'PORT': 'Server port number',
        'MONGO_URI': 'MongoDB connection string',
        'JWT_SECRET': 'JWT secret for authentication'
    };

    const optionalVars = {
        'EMAIL_USER': 'Email for sending notifications',
        'EMAIL_PASS': 'Email app password',
        'NODE_ENV': 'Node environment (development/production)'
    };

    let hasIssues = false;

    // Check required variables
    Object.entries(requiredVars).forEach(([key, description]) => {
        if (!config[key] || config[key].includes('your_') || config[key].includes('_here')) {
            console.log(`❌ ${key}: NOT CONFIGURED`);
            console.log(`   ${description}`);
            hasIssues = true;
        } else {
            // Mask sensitive values
            let displayValue = config[key];
            if (key === 'MONGO_URI') {
                displayValue = config[key].replace(/:([^@]+)@/, ':****@');
            } else if (key === 'JWT_SECRET') {
                displayValue = '****' + config[key].slice(-4);
            }
            console.log(`✅ ${key}: ${displayValue}`);
        }
    });

    console.log('');

    // Check optional variables
    Object.entries(optionalVars).forEach(([key, description]) => {
        if (!config[key] || config[key].includes('your_') || config[key].includes('_here')) {
            console.log(`⚠️  ${key}: Not configured (optional)`);
            console.log(`   ${description}`);
        } else {
            let displayValue = config[key];
            if (key === 'EMAIL_PASS') {
                displayValue = '****';
            }
            console.log(`✅ ${key}: ${displayValue}`);
        }
    });

    console.log('\n');

    if (hasIssues) {
        console.log('⚠️  REQUIRED CONFIGURATION MISSING!');
        console.log('\n📝 Action Required:');
        console.log('1. Open backend\\.env file');
        console.log('2. Update the missing/placeholder values');
        console.log('3. See MONGODB_SETUP.md for detailed MongoDB setup instructions');
        console.log('4. Run: node test_mongo_connection.js to verify MongoDB connection');
        console.log('5. Run: npm run dev to start the server\n');
    } else {
        console.log('✅ All required environment variables are configured!');
        console.log('\n📝 Next Steps:');
        console.log('1. Run: node test_mongo_connection.js to verify MongoDB connection');
        console.log('2. Run: npm run dev to start the server\n');
    }
}
