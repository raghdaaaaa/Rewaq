const Book = require('../models/book_model');

const loadBook = async (req, res, next) => {

    try {

        const book = await Book.findById(
            req.params.id
        );

        if (!book) {
            return res.status(404).json({
                msg: "Book does not exist"
            });
        }

        req.book = book;

        next();

    } catch (error) {
        next(error);
    }

};

module.exports = loadBook;