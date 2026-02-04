const Joi = require('joi');
const logger = require('../utils/logger');

const envSchema = Joi.object({
    // Node Environment
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),

    // Server
    PORT: Joi.number().default(5000),

    // Database
    DB_URL: Joi.string().required().description('MongoDB Connection String'),
    DB_TEST_URL: Joi.string().description('MongoDB Test Connection String'),

    // Security
    JWT_SECRET: Joi.string().required().min(32).description('JWT Signing Secret'),
    JWT_EXPIRES_IN: Joi.string().default('1d'),
    ALLOW_ORIGIN: Joi.string().default('*'),

    // Logging
    LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'http', 'debug').default('info'),

    // Scalability
    REDIS_URL: Joi.string().description('Redis connection string for caching and queues'),

    // Email
    MAILGUN_USER: Joi.string().description('Mailgun User'),
    MAILGUN_PASSWORD: Joi.string().description('Mailgun Password'),

    // SMS
    SMS_USER_ID: Joi.string().description('SMS Gateway User ID'),
    SMS_PASSWORD: Joi.string().description('SMS Gateway Password'),

    // Feature Flags can be added here
}).unknown(); // Allow other unknown variables

const validateEnv = () => {
    const { error, value } = envSchema.validate(process.env, { abortEarly: false });

    if (error) {
        const errorMessages = error.details.map((detail) => detail.message).join(', ');
        logger.error(`Available Environment Variables Validation Failed: ${errorMessages}`);
        // In production, we might want to throw/exit. 
        // For now, we log error.
        if (process.env.NODE_ENV === 'production') {
            throw new Error(`Environment Validation Failed: ${errorMessages}`);
        }
    }

    return value;
};

module.exports = validateEnv;
