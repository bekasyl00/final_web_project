const nodemailer = require('nodemailer');
const mailConfig = require('../config/mail.config');

let transporter = null;

const isSmtpConfigured = () => {
  return Boolean(mailConfig.host && mailConfig.port && mailConfig.auth && mailConfig.auth.user);
};

const initTransporter = () => {
  if (!isSmtpConfigured()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.port === 465,
      auth: mailConfig.auth && mailConfig.auth.user ? {
        user: mailConfig.auth.user,
        pass: mailConfig.auth.pass
      } : undefined,
      tls: {
        rejectUnauthorized: false
      }
    });

    transporter.verify()
      .then(() => {
        console.log('SMTP transporter verified and ready to send emails');
      })
      .catch((err) => {
        console.error('SMTP transporter verification failed:', err && err.message ? err.message : err);
      });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    if (!isSmtpConfigured()) {
      console.log('='.repeat(50));
      console.log('EMAIL NOTIFICATION (SMTP not configured - this would be sent):');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${text || html}`);
      console.log('='.repeat(50));
      return { success: true, message: 'Email logged (SMTP not configured)' };
    }

    const transport = initTransporter();
    const info = await transport.sendMail({
      from: `"PulseBridge" <${mailConfig.auth.user}>`,
      to,
      subject,
      text,
      html: html || text
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

const formatEventDate = (date) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const sendSubscriptionEmail = async ({ user, event, reminderHours }) => {
  if (!user || !event || !user.email) return;
  const subject = `Subscription confirmed: ${event.title}`;
  const text = `
Hello ${user.username || ''}!

You have successfully subscribed to the event: ${event.title}
Date: ${formatEventDate(event.startDate)}
Location: ${event.location || '-'}

We will remind you ${reminderHours} hours before the event starts.

---
PulseBridge
  `.trim();

  return sendEmail({
    to: user.email,
    subject,
    text
  });
};

const sendReminderEmail = async ({ user, event, reminderHours }) => {
  if (!user || !event || !user.email) return;
  const subject = `Event Reminder: ${event.title}`;
  const text = `
Hello ${user.username || ''}!

This is your reminder for the event: ${event.title}
Starts at: ${formatEventDate(event.startDate)}
Location: ${event.location || '-'}

You asked to be reminded ${reminderHours} hours before the event.

---
PulseBridge
  `.trim();

  return sendEmail({
    to: user.email,
    subject,
    text
  });
};

module.exports = {
  sendEmail,
  sendSubscriptionEmail,
  sendReminderEmail
};
