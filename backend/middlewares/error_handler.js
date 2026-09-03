module.exports = (error, req, res, next) => {
    // 1. Mongoose Duplicate Key Error (Code 11000)
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || error.keyValue || {})[0] || 'field';
        const capitalizedField = field.charAt(0).toUpperCase() + field.slice(1);
        return res.status(409).json({
            msg: `${capitalizedField} is already registered`,
            error_name: 'ConflictError',
            error_message: `${capitalizedField} is already registered. Please use another ${field}.`
        });
    }

    // 2. Mongoose Validation Error
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({
            msg: messages[0] || 'Validation error',
            error_name: 'ValidationError',
            error_message: messages.join(', '),
            errors: messages
        });
    }

    // 3. JWT Errors
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            msg: 'Invalid token, authorization denied',
            error_name: 'JsonWebTokenError',
            error_message: 'Token is invalid'
        });
    }

    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            msg: 'Token has expired, please log in again',
            error_name: 'TokenExpiredError',
            error_message: 'Token expired'
        });
    }

    // 4. Custom status code or default to 500
    const statusCode = error.statusCode || error.status || 500;
    res.status(statusCode).json({
        msg: error.message || 'Server error occurred',
        error_name: error.name || 'Error',
        error_message: error.message || 'Internal server error'
    });
};