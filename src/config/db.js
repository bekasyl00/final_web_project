const mongoose = require('mongoose');

const connectDB = async (mongoUri) => {
  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri, {
    autoIndex: true
  });

  return mongoose.connection;
};

module.exports = { connectDB };
