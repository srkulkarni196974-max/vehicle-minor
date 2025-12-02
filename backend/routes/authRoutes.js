const express = require('express');
const router = express.Router();
const { register, verifyOTP, login, sendLoginOTP, verifyLoginOTP } = require('../controllers/authController');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', require('../controllers/authController').resendOTP);
router.post('/login', login);
router.post('/send-login-otp', sendLoginOTP);
router.post('/verify-login-otp', verifyLoginOTP);
router.get('/me', require('../middleware/authMiddleware')(['admin', 'fleet_owner', 'driver']), require('../controllers/authController').getMe);

// Test endpoint to verify email is working
router.post('/test-email', async (req, res) => {
    console.log('📧 Test email endpoint called');
    const { sendOTP } = require('../services/emailService');
    const result = await sendOTP('srkulkarni1969.74@gmail.com', '123456', 'Test User');
    res.json({ success: result, message: result ? 'Email sent!' : 'Email failed' });
});

module.exports = router;
