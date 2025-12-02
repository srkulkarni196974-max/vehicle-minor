const express = require('express');
const router = express.Router();
const { syncUser, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to sync Firebase user with MongoDB (Login/Register)
// This endpoint receives the Firebase ID token in the Authorization header
router.post('/sync-user', syncUser);

// Get current user details
router.get('/me', authMiddleware(['admin', 'fleet_owner', 'driver', 'personal']), getMe);

module.exports = router;
