/**
 * config.js
 * @description :: Central configuration file for application
 */

const dotenv = require('dotenv');
dotenv.config();

const config = {
    // Server Configuration
    port: process.env.PORT || 5001,
    env: process.env.NODE_ENV || 'development',

    // Database Configuration
    db: {
        url: process.env.NODE_ENV === 'test'
            ? process.env.DB_TEST_URL
            : process.env.DB_URL,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },

    // CORS Configuration
    cors: {
        origin: process.env.ALLOW_ORIGIN || '*',
    },

    // JWT Configuration
    jwt: {
        adminSecret: process.env.JWT_ADMIN_SECRET || 'your-admin-secret',
        deviceSecret: process.env.JWT_DEVICE_SECRET || 'your-device-secret',
        clientSecret: process.env.JWT_CLIENT_SECRET || 'your-client-secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },

    // Email Configuration
    email: {
        mailgun: {
            user: process.env.MAILGUN_USER,
            password: process.env.MAILGUN_PASSWORD,
        }
    },

    // Default User Credentials (for seeding)
    defaultUsers: {
        admin: {
            username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
            email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
            password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123',
        },
        user: {
            username: process.env.DEFAULT_USER_USERNAME || 'user',
            email: process.env.DEFAULT_USER_EMAIL || 'user@example.com',
            password: process.env.DEFAULT_USER_PASSWORD || 'User@123',
        }
    },

    // Pagination defaults
    pagination: {
        defaultLimit: 10,
        maxLimit: 100,
    },

    // Rate limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
    }
};

// Validate required environment variables
const requiredEnvVars = ['DB_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0 && process.env.NODE_ENV !== 'test') {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    console.error('Please check your .env file');
    process.exit(1);
}

module.exports = config;
