/**
 * healthCheck.js
 * @description :: Health check routes for monitoring
 */

const mongoose = require('mongoose');
const os = require('os');

/**
 * @route GET /health
 * @description Basic health check
 */
const healthCheck = async (req, res) => {
    try {
        const healthData = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: require('../../package.json').version,
        };

        res.status(200).json(healthData);
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            message: error.message
        });
    }
};

/**
 * @route GET /health/detailed
 * @description Detailed health check with system metrics
 */
const detailedHealthCheck = async (req, res) => {
    try {
        // Check database connection
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

        // Get memory usage
        const memoryUsage = process.memoryUsage();
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();

        // Get CPU usage
        const cpuUsage = process.cpuUsage();

        const healthData = {
            status: dbStatus === 'connected' ? 'OK' : 'DEGRADED',
            timestamp: new Date().toISOString(),
            checks: {
                database: {
                    status: dbStatus,
                    type: 'MongoDB',
                    responseTime: null // Can add ping time if needed
                },
                memory: {
                    used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
                    total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
                    systemTotal: `${Math.round(totalMemory / 1024 / 1024)}MB`,
                    systemFree: `${Math.round(freeMemory / 1024 / 1024)}MB`,
                    percentage: `${Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)}%`
                },
                cpu: {
                    user: cpuUsage.user,
                    system: cpuUsage.system,
                    cores: os.cpus().length
                },
                system: {
                    platform: os.platform(),
                    arch: os.arch(),
                    nodeVersion: process.version,
                    uptime: `${Math.floor(process.uptime())}s`,
                    loadAverage: os.loadavg()
                }
            },
            environment: process.env.NODE_ENV || 'development',
            version: require('../../package.json').version
        };

        const statusCode = healthData.status === 'OK' ? 200 : 503;
        res.status(statusCode).json(healthData);
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * @route GET /health/ready
 * @description Readiness probe for Kubernetes/Docker
 */
const readinessCheck = async (req, res) => {
    try {
        // Check if database is ready
        const dbReady = mongoose.connection.readyState === 1;

        if (dbReady) {
            res.status(200).json({
                status: 'READY',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(503).json({
                status: 'NOT_READY',
                reason: 'Database not connected',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            message: error.message
        });
    }
};

/**
 * @route GET /health/live
 * @description Liveness probe for Kubernetes/Docker
 */
const livenessCheck = (req, res) => {
    res.status(200).json({
        status: 'ALIVE',
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    healthCheck,
    detailedHealthCheck,
    readinessCheck,
    livenessCheck
};
