const app = require('../src/app');
const mongoose = require('mongoose');
const env = require('../src/config/env');
const { connectDB } = require('../src/config/db');

module.exports = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB(env.mongoUri);
  }
  return app(req, res);
};
