const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
global.__basedir = __dirname;

const postmanToOpenApi = require('postman-to-openapi');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const listEndpoints = require('express-list-endpoints');
const logger = require('morgan');
const passport = require('passport');

const { adminPassportStrategy, errorHandler } = require('./middleware');
const { devicePassportStrategy } = require('./middleware');
const { clientPassportStrategy } = require('./middleware');

const app = express();
const corsOptions = { origin: process.env.ALLOW_ORIGIN };
app.use(cors(corsOptions));

// Template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// All routes 
const routes = require('./routes');

// Passport strategies
adminPassportStrategy(passport);
devicePassportStrategy(passport);
clientPassportStrategy(passport);

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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