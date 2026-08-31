const authorizeAdmin = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            msg: "Authentication required"
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            msg: "Forbidden"
        });
    }

    next();
};

module.exports = authorizeAdmin;