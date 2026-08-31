const User = require('../models/user_model');

const authorizeUser = async (req, res, next) => {

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

        if (user._id.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                msg: "Forbidden"
            });
        }

        next();

    } catch (error) {
        next(error);
    }
};

module.exports = authorizeUser;