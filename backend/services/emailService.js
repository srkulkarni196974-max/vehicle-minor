// Email service has been replaced with Firebase Authentication
// This file is kept as a stub to prevent import errors in legacy code

const sendOTP = async (email, otp, recipientName) => {
    console.log('📧 Email service called (Firebase Auth handles this now)');
    console.log(`   To: ${email}`);
    console.log(`   OTP: ${otp}`);
    console.log(`   Name: ${recipientName}`);
    return true;
};

module.exports = { sendOTP };
