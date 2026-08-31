const express = require('express');

const router = express.Router();

const userControl = require('../controllers/user.controller');
const loadUser = require('../middlewares/load_user');
const authenticate = require('../middlewares/authenticate');
const authorizeAdmin = require('../middlewares/authorize_admin');


// -------------------------------------------
// user and admin privilege

router.get(
    '/me',
    authenticate,
    userControl.getOwnUser
);

router.put(
    '/me',
    authenticate,
    userControl.userUpdateOwn
);

router.patch(
    '/me',
    authenticate,
    userControl.userUpdateOwn
);

router.delete(
    '/me',
    authenticate,
    userControl.userDeleteOwn
);


// -------------------------------------------
// only admin privilege

router.get(
    '/',
    authenticate,
    authorizeAdmin,
    userControl.getAllUsers
);

router.get(
    '/:id',
    authenticate,
    authorizeAdmin,
    loadUser,
    userControl.getUserById
);

router.post(
    '/',
    authenticate,
    authorizeAdmin,
    userControl.addUser
);

router.put(
    '/:id',
    authenticate,
    authorizeAdmin,
    loadUser,
    userControl.adminUpdateUser
);

router.patch(
    '/:id',
    authenticate,
    authorizeAdmin,
    loadUser,
    userControl.adminUpdateUser
);

router.delete(
    '/:id',
    authenticate,
    authorizeAdmin,
    loadUser,
    userControl.deleteUser
);

router.delete(
    '/',
    authenticate,
    authorizeAdmin,
    userControl.deleteAllUsers
);


module.exports = router;