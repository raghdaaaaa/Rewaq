const express = require('express');
const router = express.Router();
const userControl = require('../controllers/user_control');
const loadUser = require('../middlewares/load_user');
const requestDisplay = require('../middlewares/request_displayer');
// router.use(requestDisplay);

router.get('/', userControl.getAllUsers);
router.get('/:id', loadUser, userControl.getUserById);
router.post('/', userControl.addUser);
router.put('/:id', loadUser, userControl.updateUserByAdmin);
router.patch('/:id', loadUser, userControl.updateUserByAdmin);
router.delete('/:id', loadUser, userControl.deleteUser);
router.delete('/', userControl.deleteAllUsers);
router.put('/me', updateUserByOwn);
router.patch('/me', updateUserByOwn);

module.exports = router;