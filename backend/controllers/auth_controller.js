const User = require('../models/user_model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.register = async (req, res, next) => {
    try {
        let {
            name,
            email,
            password,
            phone,
            role
        } = req.body;

        password = await bcrypt.hash(req.body.password, 10);

        const user = new User({
            name,
            email,
            password,
            phone,
            role
        });

        await user.save();

        const token = jwt.sign({
            name: user.name,
            email: user.email,
            id: user._id,
            role: user.role
        }, process.env.secret_key);

        const userResponse = user.toObject();
        delete userResponse.password;
        
        res.status(201).json({
            user: user,
            token: token
        });
    }
    catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const {
            email,
            password
        } = req.body;
        
        const user = await User.findOne({ email });

        if (!await bcrypt.compare(password, user.password)) {
            return res.status(400).json({
                msg: "Invalid data"
            })
        }

        const token = jwt.sign({
            name: user.name,
            id: user._id,
            role: user.role
        }, process.env.secret_key);

        res.status(200).json({
            token
        });
    }
    catch (error) {
        next(error);
    }
};
