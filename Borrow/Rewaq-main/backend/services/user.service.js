const User = require('../models/user_model');
const bcrypt = require('bcrypt');


// Get Own User 

const getOwnUser = async (userId) => {

    const user = await User
        .findById(userId)
        .select('-password');


    if (!user) {

        const error = new Error(
            "User does not exist"
        );

        error.statusCode = 404;

        throw error;
    }


    return user;
};


// Update Own User 

const updateOwnUser = async (
    userId,
    data
) => {

    const update = {
        name: data.name,
        email: data.email,
        phone: data.phone
    };


    if (data.password) {

        update.password =
            await bcrypt.hash(
                data.password,
                10
            );
    }


    const user =
        await User.findByIdAndUpdate(
            userId,
            update,
            {
                new: true,
                runValidators: true
            }
        ).select('-password');


    return user;
};


// Delete Own User 

const deleteOwnUser = async (userId) => {

    const user =
        await User.findByIdAndDelete(
            userId
        );


    if (!user) {

        const error = new Error(
            "User does not exist"
        );

        error.statusCode = 404;

        throw error;
    }


    return user;
};


module.exports = {
    getOwnUser,
    updateOwnUser,
    deleteOwnUser
};