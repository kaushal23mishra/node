/**
 * Request Tracing Middleware
 * Generates correlation IDs and tracks request duration
 */
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
    // Generate correlation ID
    const requestId = req.headers['x-request-id'] || uuidv4();
    req.requestId = requestId; // Attach to req for controllers
    res.setHeader('x-request-id', requestId);

    // Initial state for thread-local storage
    const store = new Map();
    store.set('requestId', requestId);
    if (req.user) {
        store.set('userId', req.user.id);
    }

    // Run next() within the context of the store
    logger.context.run(store, () => {
        const start = Date.now();

        // Log request start
        logger.http(`Incoming ${req.method} ${req.originalUrl}`, {
            ip: req.ip,
            userAgent: req.get('user-agent'),
            contentLength: req.get('content-length')
        });

        // Log response on finish
        res.on('finish', () => {
            const duration = Date.now() - start;
            logger.http(`Completed ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
                statusCode: res.statusCode,
                duration,
                contentLength: res.get('content-length')
            });
        });

        next();
    });
};

module.exports = requestLogger;
