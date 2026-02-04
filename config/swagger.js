const packageJson = require('../package.json');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Node DHI API',
            version: packageJson.version,
            description: 'Enterprise Node.js API Documentation',
            contact: {
                name: 'API Support',
                email: 'support@example.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development Server',
            },
            {
                url: 'https://api.production.com',
                description: 'Production Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            responses: {
                UnauthorizedError: {
                    description: 'Access token is missing or invalid',
                },
                NotFoundError: {
                    description: 'The requested resource was not found',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Paths to files containing OpenAPI definitions
    apis: [
        './docs/api_all.yml',
        './routes/*.js',
        './routes/**/*.js',
        './controller/**/*.js',
        './models/*.js'
    ],
};

module.exports = options;
