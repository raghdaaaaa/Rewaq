const jwt = require('jsonwebtoken');
const User = require('../models/user_model');

const authenticator = async (req, res, next) => {
    try {
        let token = req.headers.authorization || req.headers.auth;

        if (!token) {
            return res.status(401).json({
                msg: "Authentication token missing, please log in"
            });
        }

        // Support standard 'Bearer <token>' format
        if (typeof token === 'string' && token.startsWith('Bearer ')) {
            token = token.slice(7).trim();
        }

        let payload;
        try {
            payload = jwt.verify(token, process.env.secret_key);
        } catch (jwtErr) {
            return res.status(401).json({
                msg: "Invalid or expired token, please log in again"
            });
        }

        const user = await User.findById(payload.id);

        if (!user) {
            return res.status(401).json({
                msg: "User does not exist"
            });
        }

        if (user.tokenVersion !== payload.tokenVersion) {
            return res.status(401).json({
                msg: "Token is no longer valid, please log in again"
            });
        }

        req.user = payload;
        next();
    }
    catch (error) {
        next(error);
    }
};

module.exports = authenticator;