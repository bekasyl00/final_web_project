const env = require('./config/env');
const { connectDB } = require('./config/db');
const app = require('./app');
const { startReminderService } = require('./services/reminder.service');

const startServer = async () => {
  try {
    await connectDB(env.mongoUri);
    startReminderService();
    app.listen(env.port, () => {
      console.log(`Server running on port http://localhost:${env.port}`); 
    

    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
