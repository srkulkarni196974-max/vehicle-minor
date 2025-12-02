const nodemailer = require('nodemailer');

// Check if we should use Resend (in production/cloud environments where SMTP is blocked)
const useResend = process.env.USE_RESEND === 'true' || process.env.RESEND_API_KEY && !process.env.EMAIL_PASS;

let transporter = null;
let Resend = null;
let resend = null;

if (useResend) {
    console.log('📧 Using Resend API for emails');
    const ResendModule = require('resend');
    Resend = ResendModule.Resend;
    resend = new Resend(process.env.RESEND_API_KEY);
} else {
    console.log('📧 Using Gmail SMTP for emails');
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
}

const createOTPEmailHTML = (otp, recipientName = 'User') => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP for VehicleTracker Login</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header with gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 20px; text-align: center;">
                            <div style="display: inline-block;">
                                <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 60px; height: 60px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                                    <span style="font-size: 32px;">🚗</span>
                                </div>
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">VehicleTracker</h1>
                                <p style="color: rgba(255, 255, 255, 0.9); margin: 5px 0 0 0; font-size: 14px;">Smart Fleet & Vehicle Management</p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 22px;">Hello ${recipientName}!</h2>
                            <p style="color: #4b5563; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">
                                Your One-Time Password (OTP) for login is:
                            </p>
                            
                            <!-- OTP Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border: 2px dashed #7c3aed; border-radius: 8px; padding: 20px; display: inline-block; min-width: 250px;">
                                            <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #7c3aed; font-family: 'Courier New', monospace;">
                                                ${otp}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #6b7280; margin: 25px 0 0 0; font-size: 14px; line-height: 1.6; text-align: center;">
                                This OTP is valid for <strong style="color: #7c3aed;">10 minutes</strong>.
                            </p>
                            
                            <p style="color: #6b7280; margin: 20px 0 0 0; font-size: 14px; line-height: 1.6; text-align: center;">
                                If you didn't request this OTP, please ignore this email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; margin: 0; font-size: 12px; text-align: center; line-height: 1.6;">
                                © 2025 VehicleTracker. All rights reserved.
                            </p>
                            <p style="color: #9ca3af; margin: 8px 0 0 0; font-size: 12px; text-align: center;">
                                This is an automated email. Please do not reply.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

const sendOTP = async (email, otp, recipientName) => {
    console.log('📧 sendOTP called for:', email);

    if (useResend) {
        // Use Resend API
        try {
            const { data, error } = await resend.emails.send({
                from: 'VehicleTracker <onboarding@resend.dev>',
                to: [email],
                subject: 'Your OTP for VehicleTracker Login',
                html: createOTPEmailHTML(otp, recipientName)
            });

            if (error) {
                console.error('❌ Resend error:', error);
                return false;
            }

            console.log('✅ OTP sent via Resend to', email);
            console.log('✅ Email ID:', data.id);
            return true;
        } catch (error) {
            console.error('❌ Error sending via Resend:', error.message);
            return false;
        }
    } else {
        // Use Gmail SMTP (callback-style for reliability)
        const mailOptions = {
            from: {
                name: 'VehicleTracker',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: 'Your OTP for VehicleTracker Login',
            text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
            html: createOTPEmailHTML(otp, recipientName)
        };

        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                console.error('❌ Email sending timeout after 30 seconds');
                resolve(false);
            }, 30000);

            transporter.sendMail(mailOptions, (error, info) => {
                clearTimeout(timeout);

                if (error) {
                    console.error('❌ Gmail SMTP error:', error.message);
                    resolve(false);
                } else {
                    console.log('✅ OTP sent via Gmail to', email);
                    console.log('✅ Message ID:', info.messageId);
                    resolve(true);
                }
            });
        });
        console.log("EMAIL_USER:", process.env.EMAIL_USER);
        console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded" : "Missing");

    }

};

module.exports = { sendOTP };
