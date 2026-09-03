const User = require('../models/user_model');
const bcrypt = require('bcrypt');



// Add User 

const addUser = async (data) => {

    const newUser = {
        ...data
    };


    if (newUser.password) {

        newUser.password =
            await bcrypt.hash(
                newUser.password,
                10
            );
    }


    const user = new User(newUser);

    await user.save();


    return user;
};


// Get All Users 

const getAllUsers = async () => {

    return await User
        .find()
        .select('-password');
};


// Get User By ID 

const getUserById = async (user) => {

    const result = user.toObject();

    delete result.password;

    return result;
};


// Update User 

const updateUser = async (
    id,
    data
) => {

    const update = {
        ...data
    };


    if (update.password) {

        update.password =
            await bcrypt.hash(
                update.password,
                10
            );
    }


    return await User.findByIdAndUpdate(
        id,
        update,
        {
            new: true,
            runValidators: true
        }
    ).select('-password');
};


// Delete User 

const deleteUser = async (id) => {

    const user =
        await User.findByIdAndDelete(id);


    if (!user) {

        const error = new Error(
            "User does not exist"
        );

        error.statusCode = 404;

        throw error;
    }


    return user;
};


// Delete All Users 

const deleteAllUsers = async () => {

    return await User.deleteMany({});
};


module.exports = {
    addUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    deleteAllUsers
};