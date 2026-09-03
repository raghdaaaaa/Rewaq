const User = require('../models/user_model');
const bcrypt = require('bcrypt');

const addUser = async (req, res, next) => {
    try {
        const newUser = { ...req.body };
        if (newUser.email) newUser.email = newUser.email.toLowerCase().trim();
        if (newUser.name) newUser.name = newUser.name.trim();
        if (newUser.phone) newUser.phone = newUser.phone.trim();

        if (!newUser.password) {
            return res.status(400).json({ msg: "Password is required" });
        }

        newUser.password = await bcrypt.hash(newUser.password, 10);

        const user = new User(newUser);
        await user.save();

        const userObj = user.toObject();
        delete userObj.password;

        res.status(201).json({
            msg: `Added (${user.name})`,
            user: userObj
        });
    } catch (err) {
        next(err);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ _id: -1 });
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: "User does not exist" });
        }
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};

const adminUpdateUser = async (req, res, next) => {
    try {
        const update = { ...req.body };

        if (update.password && update.password.trim() !== '') {
            update.password = await bcrypt.hash(update.password, 10);
        } else {
            delete update.password;
        }

        if (update.email) update.email = update.email.toLowerCase().trim();
        if (update.name) update.name = update.name.trim();
        if (update.phone) update.phone = update.phone.trim();

        const targetUser = await User.findById(req.params.id);
        if (!targetUser) {
            return res.status(404).json({ msg: "User does not exist" });
        }

        if (update.role && update.role !== targetUser.role) {
            update.tokenVersion = (targetUser.tokenVersion || 0) + 1;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            update,
            {
                returnDocument: 'after',
                runValidators: true
            }
        ).select('-password');

        res.status(200).json({
            msg: "User updated successfully",
            user: updatedUser
        });
    } catch (err) {
        next(err);
    }
};

const userUpdateOwn = async (req, res, next) => {
    try {
        const update = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone
        };

        if (update.email) update.email = update.email.toLowerCase().trim();
        if (update.name) update.name = update.name.trim();
        if (update.phone) update.phone = update.phone.trim();

        if (req.body.password && req.body.password.trim() !== '') {
            update.password = await bcrypt.hash(req.body.password, 10);
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            update,
            {
                returnDocument: 'after',
                runValidators: true
            }
        ).select('-password');

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (req.user.id === id) {
            return res.status(400).json({
                msg: "You cannot delete your own account while logged in"
            });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ msg: "User does not exist" });
        }

        res.status(200).json({
            msg: "User deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};

const deleteAllUsers = async (req, res, next) => {
    try {
        const result = await User.deleteMany({ _id: { $ne: req.user.id } });
        res.status(200).json({
            msg: `Users cleared (deleted ${result.deletedCount})`
        });
    } catch (err) {
        next(err);
    }
};

const getOwnUser = async (req, res, next) => {
    try {
        const id = req.user.id;
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: "User does not exist" });
        }
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};

const userDeleteOwn = async (req, res, next) => {
    try {
        const id = req.user.id;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ msg: "User does not exist" });
        }
        res.status(200).json({ msg: "User deleted" });
    } catch (err) {
        next(err);
    }
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
