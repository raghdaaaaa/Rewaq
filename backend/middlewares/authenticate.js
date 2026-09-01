const jwt = require('jsonwebtoken');
const User = require('../models/user_model');

const authenticator = async (req, res, next) => {
    try {
        const token = req.headers.auth;

        if (!token) {
            return res.status(400).json({
                msg: "Token not found"
            });
        }
    
        const payload = jwt.verify(token, process.env.secret_key);
        const user = await User.findById(payload.id);

        if (!user) {
            return res.status(401).json({
                msg: "User does not exist"
            });
        }
        
        // console.log("DB:", user.tokenVersion, typeof user.tokenVersion);
        // console.log("JWT:", payload.tokenVersion, typeof payload.tokenVersion);

        if (user.tokenVersion !== payload.tokenVersion) {
            return res.status(401).json({
                msg: "Token is no longer valid, please log-in"
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