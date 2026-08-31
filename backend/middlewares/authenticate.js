const jwt = require('jsonwebtoken');

const authenticator = (req, res, next) => {
    try {
        const token = req.headers.auth;

        if (!token) {
            return res.status(400).json({
                msg: "Token not found"
            });
        }
    
        const payload = jwt.verify(token, process.env.secret_key);
        req.user = payload;
        next();
    }
    catch (error) {
        next(error);
    }
};

module.exports = authenticator;