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

    return await Book.find();
};


// ===========================================
// Get Book By ID
// ===========================================

const getBookById = async (book) => {

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
    );
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

    return await Book.find({
        $or: [
            {
                title: {
                    $regex: search,
                    $options: 'i'
                }
            },
            {
                author: {
                    $regex: search,
                    $options: 'i'
                }
            }
        ]
    });
};


module.exports = {
    addNewBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook,
    deleteAllBooks,
    searchBooks
};