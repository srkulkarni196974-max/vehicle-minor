const cron = require('node-cron');
const Vehicle = require('../models/Vehicle');
const Reminder = require('../models/Reminder');
const User = require('../models/User');

const checkReminders = async () => {
    console.log('Checking for reminders...');
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    try {
        const vehicles = await Vehicle.find().populate('ownerId');

        for (const vehicle of vehicles) {
            // Check Service
            if (vehicle.serviceDate && vehicle.serviceDate <= threeDaysLater && vehicle.serviceDate >= today) {
                await sendReminder(vehicle, 'Service', vehicle.serviceDate);
            }
            // Check Insurance
            if (vehicle.insuranceExpiry && vehicle.insuranceExpiry <= threeDaysLater && vehicle.insuranceExpiry >= today) {
                await sendReminder(vehicle, 'Insurance Expiry', vehicle.insuranceExpiry);
            }
            // Check Permit
            if (vehicle.permitExpiry && vehicle.permitExpiry <= threeDaysLater && vehicle.permitExpiry >= today) {
                await sendReminder(vehicle, 'Permit Expiry', vehicle.permitExpiry);
            }
        }
    } catch (error) {
        console.error('Error checking reminders:', error);
    }
};

const sendReminder = async (vehicle, type, date) => {
    // Check if reminder already sent today/recently to avoid spam (omitted for simplicity)
    const email = vehicle.ownerId.email;
    const subject = `Reminder: ${type} for ${vehicle.registrationNumber}`;
    const text = `Hello ${vehicle.ownerId.name},\n\nThis is a reminder that your vehicle ${vehicle.registrationNumber} is due for ${type} on ${date.toDateString()}.\n\nPlease take necessary action.`;

    // TODO: Implement email sending via Firebase Cloud Functions or third-party service
    console.log(`📧 Reminder: ${subject} to ${email}`);
    console.log(`   Message: ${text}`);
};

// Schedule cron job to run every day at 9 AM
cron.schedule('0 9 * * *', checkReminders);

module.exports = { checkReminders };
