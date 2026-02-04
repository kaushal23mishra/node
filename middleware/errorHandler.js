/**
 * errorHandler.js
 * @description :: Global error handling middleware
 */

const response = require('../utils/response');

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json(
            response.validationError({
                message: err.message,
                errors: err.errors
            })
        );
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json(
            response.validationError({
                message: `${field} already exists`
            })
        );
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json(
            response.unAuthorized({ message: 'Invalid token' })
        );
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json(
            response.unAuthorized({ message: 'Token expired' })
        );
    }

    // Default to 500 server error
    return res.status(500).json(
        response.internalServerError({
            message: process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : err.message
        })
    );
};

module.exports = errorHandler;
