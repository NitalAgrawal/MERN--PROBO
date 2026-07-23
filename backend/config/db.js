const mongoose = require('mongoose');
const logger = require('../services/logger/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown — close connection when process terminates
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed (SIGINT).');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed (SIGTERM).');
  process.exit(0);
});

module.exports = connectDB;

