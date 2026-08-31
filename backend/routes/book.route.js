const express = require('express');

const router = express.Router();

const bookControl = require('../controllers/book.controller');
const loadBook = require('../middlewares/load_book');
const authenticate = require('../middlewares/authenticate');
const authorizeAdmin = require('../middlewares/authorize_admin');


// -------------------------------------------
// user and admin privilege

router.get(
   '/',
   authenticate,
   bookControl.getAllBooks
);

router.get(
   '/search',
   authenticate,
   bookControl.searchBooks
);

router.get(
   '/:id',
   authenticate,
   loadBook,
   bookControl.getBookById
);


// -------------------------------------------
// only admin privilege

router.post(
   '/',
   authenticate,
   authorizeAdmin,
   bookControl.addNewBook
);

router.put(
   '/:id',
   authenticate,
   authorizeAdmin,
   loadBook,
   bookControl.updateBook
);

router.patch(
   '/:id',
   authenticate,
   authorizeAdmin,
   loadBook,
   bookControl.updateBook
);

router.delete(
   '/:id',
   authenticate,
   authorizeAdmin,
   loadBook,
   bookControl.deleteBook
);

router.delete(
   '/',
   authenticate,
   authorizeAdmin,
   bookControl.deleteAllBooks
);


module.exports = router;