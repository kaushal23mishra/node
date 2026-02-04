const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Global Setup
beforeAll(async () => {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_key_must_be_at_least_32_chars_long';
    process.env.DB_URL = 'mongodb://localhost:27017/test';
    process.env.REDIS_URL = 'redis://localhost:6379';
});

// Global Teardown
afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});
