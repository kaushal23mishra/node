

const mongoose = require('mongoose');
const logger = require('../../utils/logger');

// Configure mongoose settings
mongoose.set('strictQuery', false);

const uri = process.env.NODE_ENV === 'test'
  ? process.env.DB_TEST_URL
  : process.env.DB_URL;

if (!uri) {
  logger.error('Database URI is not defined in environment variables');
  process.exit(1);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(uri, {
      // Mongoose 6 defaults are usually sufficient
      // Add timeouts if necessary
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Error in mongodb connection', error);
    process.exit(1);
  }
};

// Handle Connection Events
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected! Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

// Graceful Exit
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed due to app termination');
  process.exit(0);
});

// Auto-connect
connectDB();

module.exports = mongoose;