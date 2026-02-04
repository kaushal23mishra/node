const dotenv = require('dotenv');
const path = require('path');
const validateEnv = require('./validateEnv');

// Load .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

// Validate and parse
validateEnv();

const config = {
    env: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',

    server: {
        port: parseInt(process.env.PORT, 10) || 5000,
    },

    db: {
        uri: process.env.NODE_ENV === 'test' ? process.env.DB_TEST_URL : process.env.DB_URL,
    },

    security: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
        corsOrigin: process.env.ALLOW_ORIGIN || '*',
    },

    logs: {
        level: process.env.LOG_LEVEL || 'info',
    },

    redis: {
        url: process.env.REDIS_URL,
    },

    email: {
        user: process.env.MAILGUN_USER,
        password: process.env.MAILGUN_PASSWORD,
    },

    sms: {
        userId: process.env.SMS_USER_ID,
        password: process.env.SMS_PASSWORD,
    }
};

module.exports = config;
