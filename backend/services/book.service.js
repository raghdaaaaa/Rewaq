const Book = require('../models/book_model');


// ===========================================
// Add Book
// ===========================================

const addNewBook = async (content) => {

    const exists = await Book.findOne({
        title: content.title,
        author: content.author
    });

    if (exists) {

        const error = new Error(
            "Book already exists"
        );

        error.statusCode = 409;

        throw error;
    }

    const book = new Book(content);

    await book.save();

    return book;
};


// ===========================================
// Get All Books
// ===========================================

const getAllBooks = async () => {
    return await Book.find().select('-coverImage.data');
};


// ===========================================
// Get Book By ID
// ===========================================

const getBookById = async (book) => {
    return book;
};


// ===========================================
// Get Book Cover
// ===========================================

const getBookCover = async (book) => {

    if (!book.coverImage || !book.coverImage.data) {

        const error = new Error(
            "Book cover does not exist"
        );

        error.statusCode = 404;

        throw error;
    }

    return book;
};


// ===========================================
// Update Book
// ===========================================

const updateBook = async (id, update) => {

    return await Book.findByIdAndUpdate(
        id,
        update,
        {
            new: true,
            runValidators: true
        }
    ).select('-coverImage.data');
};


// ===========================================
// Delete Book
// ===========================================

const deleteBook = async (id) => {

    return await Book.findByIdAndDelete(id);
};


// ===========================================
// Delete All Books
// ===========================================

const deleteAllBooks = async () => {

    return await Book.deleteMany({});
};


// ===========================================
// Search Books
// ===========================================

const searchBooks = async (search) => {
    if (!search || search.trim() === '') {
        return await Book.find().select('-coverImage.data');
    }

    const trimmed = search.trim();
    return await Book.find({
        $or: [
            {
                title: {
                    $regex: trimmed,
                    $options: 'i'
                }
            },
            {
                author: {
                    $regex: trimmed,
                    $options: 'i'
                }
            }
        ]
    }).select('-coverImage.data');
};


module.exports = {
    addNewBook,
    getAllBooks,
    getBookById,
    getBookCover,
    updateBook,
    deleteBook,
    deleteAllBooks,
    searchBooks
};