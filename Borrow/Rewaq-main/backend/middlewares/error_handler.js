module.exports = (error, req, res, next) => {
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || error.keyValue || {})[0] || 'field';
        const capitalizedField = field.charAt(0).toUpperCase() + field.slice(1);
        return res.status(409).json({
            msg: `${capitalizedField} is already registered`,
            error_name: 'ConflictError',
            error_message: `${capitalizedField} is already registered. Please use another ${field}.`
        });
    }

    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({
            msg: messages[0] || 'Validation error',
            error_name: 'ValidationError',
            error_message: messages.join(', '),
            errors: messages
        });
    }

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

    const statusCode = error.statusCode || error.status || 500;
    res.status(statusCode).json({
        msg: error.message || 'Server error occurred',
        error_name: error.name || 'Error',
        error_message: error.message || 'Internal server error'
    });
};
