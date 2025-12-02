require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendTestEmail = async () => {
    console.log('Attempting to send email with Resend...');

    try {
        const { data, error } = await resend.emails.send({
            from: 'VehicleTracker <onboarding@resend.dev>',
            to: ['sampaisa@example.com'], // Replace with a valid email or use env var
            subject: 'Test Email from Vehicle System (Resend)',
            html: '<strong>If you see this, Resend email sending is working!</strong>'
        });

        if (error) {
            console.error('Error sending email:', error);
            return;
        }

        console.log('Email sent successfully!');
        console.log('ID:', data.id);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

sendTestEmail();
