const express = require('express');
const router = express.Router();
const bookControl = require('../controllers/book_control');
const requestDisplay = require('../middlewares/request_displayer');
const loadBook = require('../middlewares/load_book');
// router.use(requestDisplay);

router.get('/', bookControl.getAllBooks);
router.get('/:id', loadBook, bookControl.getBookById);
router.post('/', bookControl.addNewBook);
router.put('/:id', loadBook, bookControl.updateBook);
router.patch('/:id', loadBook, bookControl.updateBook);
router.delete('/:id', loadBook, bookControl.deleteBook);
router.delete('/', bookControl.deleteAllBooks);

module.exports = router;