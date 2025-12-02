require('dotenv').config();
const { Resend } = require('resend');

const sendTestEmail = async () => {
    console.log('Attempting to send email via Resend...');

    if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY is missing in .env file');
        return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { data, error } = await resend.emails.send({
            from: 'VehicleTracker <onboarding@resend.dev>',
            to: ['delivered@resend.dev'], // Test address
            subject: 'Test Email from Vehicle System',
            html: '<p>If you see this, <strong>Resend API</strong> is working!</p>'
        });

        if (error) {
            console.error('❌ Error sending email:', error);
        } else {
            console.log('✅ Email sent successfully!');
            console.log('Message ID:', data.id);
        }
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
};

sendTestEmail();
