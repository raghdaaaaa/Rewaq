const User = require('../models/user_model');
const bcrypt = require('bcrypt');

const addUser = async (req, res) => {
    const newUser = req.body;
    newUser.password = await bcrypt.hash(newUser.password, 10);

    const user = new User(newUser);
    await user.save();

    res.status(201).json({
        msg: `Added (${user.name})`
    });
};

const getAllUsers = async (req, res) => {
    const users = await User.find().select('-password');

    res.status(200).json(users);
};

const getUserById = async (req, res) => {
    const user = req.user.toObject();
    delete user.password;
    res.status(200).json(user);
};

const adminUpdateUser = async (req, res, next) => {
    const update = { ...req.body };

    if (update.password) {
        update.password = await bcrypt.hash(update.password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id,update,
        {
            new: true,
            runValidators: true
        }
    ).select('-password');

    res.status(200).json(user);
};

const userUpdateOwn = async (req, res, next) => {
    const update = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone
    };

    if (req.body.password) {
        update.password = await bcrypt.hash(req.body.password, 10);
    }

    const user = await User.findByIdAndUpdate(req.user.id, update,
        {
            returnDocument: 'after',
            runValidators: true
        }
    ).select('-password');

    res.status(200).json(user);
};

const deleteUser = async (req, res) => {
    const id = req.params.id;
    await User.findByIdAndDelete(id);

    res.status(200).json({
        msg: "User deleted"
    });
};

const deleteAllUsers = async (req, res) => {
    const result = await User.deleteMany({});

    if (result.deletedCount === 0) {
        return res.status(200).json({
            msg: "Users collection already empty"
        });
    }

    res.status(200).json({
        msg: "Users collection cleared"
    });
};

const getOwnUser = async (req, res) => {
    const id = req.user.id;
    let user = await User.findById(id);
    user = user.toObject();
    delete user.password;

    res.status(200).json(user);
};

const userDeleteOwn = async (req, res) => {
    const id = req.user.id;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
        return res.status(404).json({
            msg: "User does not exist"
        });
    }

    res.status(200).json({
        msg: "User deleted"
    });
};

module.exports = {
    addUser,
    getAllUsers,
    getUserById,
    adminUpdateUser,
    userUpdateOwn,
    deleteUser,
    deleteAllUsers,
    getOwnUser,
    userDeleteOwn
};
