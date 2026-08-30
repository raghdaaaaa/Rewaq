const User = require('../models/user_model');

const loadUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                msg: "User does not exist"
            });
        }

        req.user = user;
        next();
    }
    catch (error) {
        next(error);
    }
};

module.exports = loadUser;