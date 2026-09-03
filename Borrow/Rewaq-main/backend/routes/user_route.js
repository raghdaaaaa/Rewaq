const express = require('express');
const router = express.Router();
const userControl = require('../controllers/user_control');
const loadUser = require('../middlewares/load_user');
const requestDisplay = require('../middlewares/request_displayer');
const authenticate = require('../middlewares/authenticate');
// const authorizeUser = require('../middlewares/authorize_user');
const authorizeAdmin = require('../middlewares/authorize_admin');

// router.use(requestDisplay);

//   user and admin privilege
router.get('/me', authenticate, userControl.getOwnUser);
router.put('/me', authenticate, userControl.userUpdateOwn);
router.patch('/me', authenticate, userControl.userUpdateOwn);
router.delete('/me', authenticate, userControl.userDeleteOwn);

//  only admin privilege
router.get('/', authenticate, authorizeAdmin, userControl.getAllUsers);
router.get('/:id', authenticate, authorizeAdmin, loadUser, userControl.getUserById);
router.post('/', authenticate, authorizeAdmin, userControl.addUser);
router.put('/:id', authenticate, authorizeAdmin, loadUser, userControl.adminUpdateUser);
router.patch('/:id', authenticate, authorizeAdmin, loadUser, userControl.adminUpdateUser);
router.delete('/:id', authenticate, authorizeAdmin, loadUser, userControl.deleteUser);
router.delete('/', authenticate, authorizeAdmin, userControl.deleteAllUsers);


module.exports = router;