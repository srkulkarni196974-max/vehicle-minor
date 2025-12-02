const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Only initialize if all required config is present, otherwise warn (to prevent crash on startup if env not set yet)
if (serviceAccount.projectId && serviceAccount.privateKey && serviceAccount.clientEmail) {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('🔥 Firebase Admin Initialized');
    }
} else {
    console.warn('⚠️ Firebase Admin NOT initialized. Missing environment variables (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL).');
}

module.exports = admin;
