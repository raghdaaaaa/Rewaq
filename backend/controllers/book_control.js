const Book = require('../models/book_model');

const addNewBook = async (req, res) => {
    const content = req.body;

    const exists = await Book.findOne({
        title: content.title,
        author: content.author
    });

    if (exists) {
        return res.status(409).json({
            msg: "Book already exists"
        });
    }

    const book = new Book(content);

    await book.save();
    res.status(201).json({
        msg: `Added (${book.title})`
    });
};

const getAllBooks = async (req, res) => {
    const books = await Book.find();
    res.status(200).json(books);
};

const getBookById = async (req, res) => {
    const book = req.book;
    res.status(200).json(book);
};

const updateBook = async (req, res) => {
    const id = req.params.id;
    const update = req.body;
    const book = await Book.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true
    });

    res.status(200).json(book);
};

const deleteBook = async (req, res) => {
    const id = req.params.id;
    await Book.findByIdAndDelete(id);

    res.status(200).json({
        msg: "Book deleted"
    });
};

const deleteAllBooks = async (req, res) => {
    const result = await Book.deleteMany({});

    if (result.deletedCount === 0) {
        return res.status(200).json({
            msg: "Books collection already empty"
        });
    }

    res.status(200).json({
        msg: "Books collection cleared"
    });
};

module.exports = {
    addNewBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook,
    deleteAllBooks
};