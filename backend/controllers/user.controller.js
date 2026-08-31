const userService =
    require('../services/user.service');

const adminUserService =
    require('../services/adminUser.service');


// ===========================================
// User: Get Own User
// ===========================================

const getOwnUser = async (req, res, next) => {

    try {

        const user =
            await userService.getOwnUser(
                req.user.id
            );


        res.status(200).json(user);

    } catch (error) {

        next(error);

    }
};


// ===========================================
// User: Update Own User
// ===========================================

const userUpdateOwn = async (
    req,
    res,
    next
) => {

    try {

        const user =
            await userService.updateOwnUser(
                req.user.id,
                req.body
            );


        res.status(200).json(user);

    } catch (error) {

        next(error);

    }
};


// ===========================================
// User: Delete Own User
// ===========================================

const userDeleteOwn = async (
    req,
    res,
    next
) => {

    try {

        await userService.deleteOwnUser(
            req.user.id
        );


        res.status(200).json({
            msg: "User deleted"
        });

    } catch (error) {

        next(error);

    }
};


// ===========================================
// Admin: Add User
// ===========================================

const addUser = async (
    req,
    res,
    next
) => {

    try {

        const user =
            await adminUserService.addUser(
                req.body
            );


        res.status(201).json({
            msg: `Added (${user.name})`
        });

    } catch (error) {

        next(error);

    }
};


// ===========================================
// Admin: Get All Users
// ===========================================

const getAllUsers = async (
    req,
    res,
    next
) => {

    try {

        const users =
            await adminUserService.getAllUsers();


        res.status(200).json(users);

    } catch (error) {

        next(error);

    }
};


// ===========================================
// Admin: Get User By ID
// ===========================================

const getUserById = async (
    req,
    res,
    next
) => {

    try {

        const user =
            await adminUserService.getUserById(
                req.user
            );


        res.status(200).json(user);

    } catch (error) {

        next(error);

    }
};


// ===========================================
// Admin: Update User
// ===========================================

const adminUpdateUser = async (
    req,
    res,
    next
) => {

    try {

        const user =
            await adminUserService.updateUser(
                req.params.id,
                req.body
            );


        res.status(200).json(user);

    } catch (error) {

        next(error);

    }
};


// ===========================================
// Admin: Delete User
// ===========================================

const deleteUser = async (
    req,
    res,
    next
) => {

    try {

        await adminUserService.deleteUser(
            req.params.id
        );


        res.status(200).json({
            msg: "User deleted"
        });

    } catch (error) {

        next(error);

    }
};


// ===========================================
// Admin: Delete All Users
// ===========================================

const deleteAllUsers = async (
    req,
    res,
    next
) => {

    try {

        const result =
            await adminUserService.deleteAllUsers();


        if (result.deletedCount === 0) {

            return res.status(200).json({
                msg: "Users collection already empty"
            });
        }


        res.status(200).json({
            msg: "Users collection cleared"
        });

    } catch (error) {

        next(error);

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