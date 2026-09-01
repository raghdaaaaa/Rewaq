const User = require('../models/user_model');

const authorizer = async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                msg: "User does not exist"
            });
        }

        if (req.user.role === "admin") {
            return next();
        }

        if (user._id.toString() !== id) {
            return res.status(403).json({
                msg: "Forbidden"
            });
        }

            next();
        }
    catch (error) {
        next(error);
    }

};

module.exports = authorizer;