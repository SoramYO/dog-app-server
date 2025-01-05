const createError = require("http-errors");

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Default error
    let error = {
        status: err.status || 500,
        message: err.message || "Internal Server Error",
    };

    // Mongoose validation error
    if (err.name === "ValidationError") {
        error.status = 400;
        error.message = Object.values(err.errors).map((val) => val.message);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        error.status = 400;
        error.message = "Duplicate value entered";
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        error.status = 401;
        error.message = "Invalid token";
    }

    if (err.name === "TokenExpiredError") {
        error.status = 401;
        error.message = "Token expired";
    }

    res.status(error.status).json({
        success: false,
        error: {
            message: error.message,
            ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        },
    });
};

module.exports = errorHandler;