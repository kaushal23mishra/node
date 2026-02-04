/**
 * logger.js
 * @description :: Winston logger configuration for structured logging
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const { AsyncLocalStorage } = require('async_hooks');

// Create storage for request context
const asyncLocalStorage = new AsyncLocalStorage();

// Format to inject correlation ID
const injectRequestId = winston.format((info) => {
    const store = asyncLocalStorage.getStore();
    if (store && store.get('requestId')) {
        info.requestId = store.get('requestId');
    }
    return info;
});

// Define log format
const logFormat = winston.format.combine(
    injectRequestId(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
        let msg = `${timestamp} [${level}]`;
        if (requestId) msg += ` [${requestId}]`;
        msg += `: ${message}`;

        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
    })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
const fs = require('fs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Daily rotate file transport for errors
const errorFileTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d',
    format: logFormat
});

// Daily rotate file transport for all logs
const combinedFileTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: logFormat
});

// Daily rotate file transport for HTTP requests
const httpFileTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'http-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'http',
    maxSize: '20m',
    maxFiles: '7d',
    format: logFormat
});

// Create Winston logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: {
        service: 'node-api',
        environment: process.env.NODE_ENV || 'development'
    },
    transports: [
        errorFileTransport,
        combinedFileTransport,
        httpFileTransport
    ],
    exceptionHandlers: [
        new DailyRotateFile({
            filename: path.join(logsDir, 'exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d'
        })
    ],
    rejectionHandlers: [
        new DailyRotateFile({
            filename: path.join(logsDir, 'rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d'
        })
    ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat
    }));
}

// Create a stream object for Morgan
logger.stream = {
    write: (message) => {
        logger.http(message.trim());
    }
};

// Helper methods for common logging patterns
logger.logRequest = (req, message = 'Request received') => {
    logger.http(message, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
};

logger.logResponse = (req, res, responseTime) => {
    logger.http('Response sent', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        ip: req.ip
    });
};

logger.logError = (error, req = null) => {
    const errorLog = {
        message: error.message,
        stack: error.stack,
        code: error.code
    };

    if (req) {
        errorLog.request = {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            body: req.body
        };
    }

    logger.error('Error occurred', errorLog);
};

logger.logDatabaseQuery = (query, duration) => {
    logger.debug('Database query', {
        query,
        duration: `${duration}ms`
    });
};

logger.logAuth = (action, userId, success, details = {}) => {
    logger.info(`Authentication: ${action}`, {
        userId,
        success,
        ...details
    });
};

// Export logger instance and context store
logger.context = asyncLocalStorage;
module.exports = logger;
