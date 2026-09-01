const express = require('express');

const router = express.Router();

const borrowingControl = require('../controllers/borrowing.controller');
const authenticate = require('../middlewares/authenticate');


router.post(
    '/borrow',
    authenticate,
    borrowingControl.borrowBook
);


router.post(
    '/return/:borrowingId',
    authenticate,
    borrowingControl.returnBook
);


module.exports = router;