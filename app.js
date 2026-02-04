const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

dotenv.config();
global.__basedir = __dirname;

const swaggerUi = require('swagger-ui-express');
const listEndpoints = require('express-list-endpoints');
const morgan = require('morgan');
const passport = require('passport');
const logger = require('./utils/logger');

const {
  adminPassportStrategy, errorHandler, apiVersion
} = require('./middleware');
const { devicePassportStrategy } = require('./middleware');
const { clientPassportStrategy } = require('./middleware');

const app = express();
const requestLogger = require('./middleware/requestLogger');

// Middleware: Request Tracing (MUST be first)
app.use(requestLogger);

// Middleware: API Versioning
app.use(apiVersion);

// Middleware: Prometheus Metrics
const metricsMiddleware = require('./middleware/metricsMiddleware');
app.use(metricsMiddleware);

// Endpoint: Prometheus Metrics
const { register } = require('./utils/metrics');
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Performance: Compress responses
app.use(compression());

// Security: Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://dxuoui1db8w1y.cloudfront.net"],
      scriptSrc: ["'self'"],
    },
  },
}));

// Security: Sanitize data (NoSQL Injection)
app.use(mongoSanitize());

// Security: Prevent XSS
app.use(xss());

// Security: Prevent HTTP Parameter Pollution
app.use(hpp());

// Security: Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// CORS
const corsOptions = { origin: process.env.ALLOW_ORIGIN };
app.use(cors(corsOptions));

// Template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Health check routes (before authentication)
const healthCheckController = require('./controller/common/healthCheck');
app.get('/health', healthCheckController.healthCheck);
app.get('/health/detailed', healthCheckController.detailedHealthCheck);
app.get('/health/ready', healthCheckController.readinessCheck);
app.get('/health/live', healthCheckController.livenessCheck);

// All routes 
const routes = require('./routes');

// Passport strategies
adminPassportStrategy(passport);
devicePassportStrategy(passport);
clientPassportStrategy(passport);

// Middleware
// HTTP request logging with Winston
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json({ limit: '10mb' })); // Add size limit
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(routes);

// Global error handler (must be after routes)
app.use(errorHandler);

// Code-First Swagger Documentation (Preferred)
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerConfig = require('./config/swagger');
const swaggerSpecs = swaggerJsDoc(swaggerConfig);

app.use('/api-docs', swaggerUi.serveFiles(swaggerSpecs), swaggerUi.setup(swaggerSpecs));
app.get('/api-docs-json', (req, res) => res.json(swaggerSpecs));

// Redirect /swagger to /api-docs for legacy support
app.get('/swagger', (req, res) => res.redirect('/api-docs'));

app.get('/', (req, res) => {
  res.render('index');
});

if (process.env.NODE_ENV !== 'test') {
  const seeder = require('./seeders');
  const allRegisterRoutes = listEndpoints(app);
  seeder(allRegisterRoutes).then(() => {
    logger.info('✅ Database seeding completed');
  });
  app.listen(process.env.PORT, () => {
    logger.info(`🚀 Server running on port ${process.env.PORT}`);
  });
}

// Global Exception/Rejection Handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason: reason.message || reason });
  // In production, you might want to exit and let PM2/K8s restart
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception thrown', { error: err.message, stack: err.stack });
  // Always exit on uncaught exception to avoid inconsistent state
  process.exit(1);
});

module.exports = app;