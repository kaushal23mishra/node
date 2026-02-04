/**
 * Cluster Entry Point
 * Spawns a worker for each CPU core to maximize performance.
 */
const cluster = require('cluster');
const os = require('os');
const logger = require('./utils/logger');

if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    logger.info(`Primary ${process.pid} is running`);
    logger.info(`Forking ${numCPUs} workers...`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        logger.warn(`Worker ${worker.process.pid} died. Forking replacement...`);
        cluster.fork();
    });
} else {
    // Workers can share any TCP connection
    require('./app');
    // Note: app.js exports setup but doesn't listen in production? 
    // Actually app.js listens on line ~121 if not test.
    // We need to ensure app.js separates listen logic if we use this.

    // For now, this is a demonstration file.
    // Ideally, app.js should separate 'express app creation' from 'server.listen'.
    // See below for how we might want to refactor if we were committed to this path.
    console.log(`Worker ${process.pid} started`);
}
