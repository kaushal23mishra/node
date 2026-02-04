# NodeJS, Mongoose, Express Project in Clean-Code Architecture

**Supported version of nodejs >= 12**  
**Supported version of mongoose >= 6**

## About 
- This is a Node application, developed in Clean-code architecture with Node.js, ExpressJS, and Mongoose ODM.
- A MongoDB database is used for data storage, with object modeling provided by Mongoose.

## Prerequisites
- Node.js (>= 12)
- MongoDB (>= 4.0)
- npm or yarn

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd node_dhi
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy the example environment file and update with your credentials:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
- Database URL
- JWT secrets (generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- Email credentials
- Other settings

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# macOS (with Homebrew)
brew services start mongodb-community@7.0

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 5. Run the application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 5001)

## Default Credentials

After first run, the application will seed default users:

**Admin User:**
- Username: Check `.env` file for `DEFAULT_ADMIN_USERNAME`
- Password: Check `.env` file for `DEFAULT_ADMIN_PASSWORD`

**Regular User:**
- Username: Check `.env` file for `DEFAULT_USER_USERNAME`
- Password: Check `.env` file for `DEFAULT_USER_PASSWORD`

⚠️ **Important:** Change these credentials in production!

## Available Scripts

- `npm start` - Start the application in production mode
- `npm run dev` - Start the application in development mode with nodemon
- `npm test` - Run test suite
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix ESLint errors automatically

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:5001/swagger`
- Postman collection: Import `postman/postman-collection.json`

## Docker Support

### Build the image
```bash
docker build --pull --rm -f "Dockerfile" -t node-app:latest "."
```

### Run the container
```bash
docker run -p 5001:5001 node-app
```

### Using Docker Compose
```bash
docker-compose up
```

## Project Structure

```
├── app.js                      - Application entry point
├── constants                   - Application constants
├── controller                  - Route controllers (HTTP layer)
│   ├── admin                   - Admin platform controllers
│   ├── client                  - Client platform controllers
│   └── device                  - Device platform controllers
├── data-access                 - Database access layer
├── db                          - Database configuration
│   └── mongoDB
│       ├── models              - Mongoose schemas
│       ├── dbService.js        - Database operations
│       └── connection.js       - Database connection
├── entities                    - Business entities
├── jobs                        - CRON jobs/Schedulers
├── middleware                  - Express middleware
│   ├── auth.js                 - Authentication
│   ├── loginUser.js            - JWT verification
│   ├── checkRolePermission.js  - Authorization
│   └── errorHandler.js         - Global error handler
├── postman                     - API documentation
├── routes                      - Application routes
├── seeders                     - Database seeders
├── services                    - External services (email, SMS, etc.)
├── use-case                    - Business logic layer
├── utils                       - Utility functions
├── validation                  - Input validation (Joi schemas)
└── views                       - EJS templates
```

## Architecture

This project follows **Clean Architecture** principles:

1. **Controllers** - Handle HTTP requests/responses
2. **Use Cases** - Contain pure business logic
3. **Data Access** - Abstract database operations
4. **Entities** - Define business objects
5. **Middleware** - Handle cross-cutting concerns

### Benefits:
- ✅ Separation of concerns
- ✅ Testable business logic
- ✅ Framework independence
- ✅ Easy to maintain and scale

## Security Best Practices

- All passwords are hashed using bcrypt
- JWT tokens for authentication
- Role-based access control (RBAC)
- Input validation using Joi
- CORS protection
- Rate limiting available
- Environment variables for sensitive data

## Testing

Run the test suite:
```bash
npm test
```

Tests use a separate test database configured in `.env` (DB_TEST_URL)

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check database URL in `.env`
- Verify network connectivity

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using the port

### Module Not Found
- Run `npm install` again
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Support

For issues and questions, please create an issue in the repository.
