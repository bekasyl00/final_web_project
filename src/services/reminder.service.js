const VolunteerShift = require('../models/volunteerShift.model');
const { sendReminderEmail } = require('./mail.service');

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;

let intervalId = null;

const shouldSendReminder = (subscription, now) => {
  if (!subscription.event || !subscription.event.startDate) return false;
  const reminderHours = Number(subscription.reminderHours || 24);
  const reminderTime = new Date(subscription.event.startDate.getTime() - reminderHours * 60 * 60 * 1000);
  return now >= reminderTime && now <= subscription.event.startDate;
};

const runReminderCheck = async () => {
  try {
    const now = new Date();
    const subscriptions = await VolunteerShift.find({
      status: 'subscribed',
      reminderSent: false
    })
      .populate('event')
      .populate('volunteer');

    for (const subscription of subscriptions) {
      if (!subscription.event || !subscription.event.startDate) {
        continue;
      }

      if (now > subscription.event.startDate) {
        subscription.reminderSent = true;
        await subscription.save();
        continue;
      }

      if (!shouldSendReminder(subscription, now)) {
        continue;
      }

      const user = subscription.volunteer;
      if (!user || !user.email) {
        continue;
      }

      try {
        await sendReminderEmail({
          user,
          event: subscription.event,
          reminderHours: subscription.reminderHours || 24
        });
        subscription.reminderSent = true;
        await subscription.save();
      } catch (err) {
        console.error('Failed to send reminder email:', err && err.message ? err.message : err);
      }
    }
  } catch (error) {
    console.error('Reminder check failed:', error && error.message ? error.message : error);
  }
};

const startReminderService = () => {
  if (intervalId) return;
  const interval = Number(process.env.REMINDER_INTERVAL_MS || DEFAULT_INTERVAL_MS);
  intervalId = setInterval(runReminderCheck, interval);
  runReminderCheck();
  console.log(`Reminder service started (interval: ${interval}ms)`);
};

const stopReminderService = () => {
  if (!intervalId) return;
  clearInterval(intervalId);
  intervalId = null;
};

module.exports = {
  startReminderService,
  stopReminderService
};
