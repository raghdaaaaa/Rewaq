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

router.get(
    '/my-books',
    authenticate,
    borrowingControl.getMyBooks
);

router.get(
    '/history',
    authenticate,
    borrowingControl.getMyHistory
);


module.exports = router;