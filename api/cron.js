const { connectDB } = require('../src/config/db');
const { runReminderCheck } = require('../src/services/reminder.service');
const env = require('../src/config/env');

module.exports = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Optional: Add simple secret verification
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectDB(env.mongoUri);
    console.log('Running reminder cron job...');
    await runReminderCheck();
    console.log('Cron job finished.');
    return res.status(200).json({ success: true, message: 'Cron job executed' });
  } catch (error) {
    console.error('Error in cron job:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
