const bookService = require('../services/book.service');


// ===========================================
// Add Book
// ===========================================

const addNewBook = async (req, res, next) => {

   try {

      const book = await bookService.addNewBook(
         req.body
      );

      res.status(201).json({
         msg: `Added (${book.title})`
      });

   } catch (error) {

      next(error);

   }
};


// ===========================================
// Get All Books
// ===========================================

const getAllBooks = async (req, res, next) => {

   try {

      const books = await bookService.getAllBooks();

      res.status(200).json(books);

   } catch (error) {

      next(error);

   }
};


// ===========================================
// Get Book By ID
// ===========================================

const getBookById = async (req, res, next) => {

   try {

      const book = await bookService.getBookById(
         req.book
      );

      res.status(200).json(book);

   } catch (error) {

      next(error);

   }
};


// ===========================================
// Update Book
// ===========================================

const updateBook = async (req, res, next) => {

   try {

      const book = await bookService.updateBook(
         req.params.id,
         req.body
      );

      res.status(200).json(book);

   } catch (error) {

      next(error);

   }
};


// ===========================================
// Delete Book
// ===========================================

const deleteBook = async (req, res, next) => {

   try {

      await bookService.deleteBook(
         req.params.id
      );

      res.status(200).json({
         msg: "Book deleted"
      });

   } catch (error) {

      next(error);

   }
};


// ===========================================
// Delete All Books
// ===========================================

const deleteAllBooks = async (req, res, next) => {

   try {

      const result =
         await bookService.deleteAllBooks();


      if (result.deletedCount === 0) {

         return res.status(200).json({
            msg: "Books collection already empty"
         });
      }


      res.status(200).json({
         msg: "Books collection cleared"
      });

   } catch (error) {

      next(error);

   }
};


// ===========================================
// Search Books
// ===========================================

const searchBooks = async (req, res, next) => {

   try {

      const books =
         await bookService.searchBooks(
            req.query.search
         );

      res.status(200).json(books);

   } catch (error) {

      next(error);

   }
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