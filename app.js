const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();
global.__basedir = __dirname;

const postmanToOpenApi = require('postman-to-openapi');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const listEndpoints = require('express-list-endpoints');
const morgan = require('morgan');
const passport = require('passport');
const logger = require('./utils/logger');

const { adminPassportStrategy, errorHandler } = require('./middleware');
const { devicePassportStrategy } = require('./middleware');
const { clientPassportStrategy } = require('./middleware');

const app = express();

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

// Swagger Documentation
postmanToOpenApi('postman/postman-collection.json', path.join('postman/swagger.yml'), { defaultTag: 'General' })
  .then(data => {
    const result = YAML.load('postman/swagger.yml');
    result.servers[0].url = '/';
    app.use('/swagger', swaggerUi.serve, swaggerUi.setup(result));
  })
  .catch(e => {
    console.error('Swagger generation failed:', e.message);
  });

app.get('/', (req, res) => {
  res.render('index');
});

if (process.env.NODE_ENV !== 'test') {
  const seeder = require('./seeders');
  const allRegisterRoutes = listEndpoints(app);
  seeder(allRegisterRoutes).then(() => {
    console.log('✅ Database seeding completed');
  });
  app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on port ${process.env.PORT}`);
  });
} else {
  module.exports = app;
}