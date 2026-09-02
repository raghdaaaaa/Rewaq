const Borrowing = require('../models/borrowing_model');
const Book = require('../models/book_model');


// ===========================================
// Borrow Book
// ===========================================

const borrowBook = async (userId, bookId) => {

   const book = await Book.findById(bookId);


   if (!book) {

      const error = new Error(
         "Book does not exist"
      );
      error.statusCode = 404;

      throw error;
   }
   if (!book.available) {

      const error = new Error(
         "Book is not available"
      );
      error.statusCode = 400;

      throw error;
   }

   const borrowing = await Borrowing.create({
      userId,
      bookId
   });
   book.available = false;

   await book.save();
   return borrowing;
};


// ===========================================
// Return Book
// ===========================================

const returnBook = async (
   userId,
   borrowingId
) => {

   const borrowing =
      await Borrowing.findById(
         borrowingId
      );
   if (!borrowing) {

      const error = new Error(
         "Borrowing does not exist"
      );
      error.statusCode = 404;
      throw error;
   }
   if (
      borrowing.userId.toString() !==
      userId.toString()
   ) {

      const error = new Error(
         "You are not allowed to return this book"
      );

      error.statusCode = 403;

      throw error;
   }
   if (borrowing.endDate) {

      const error = new Error(
         "Book is already returned"
      );

      error.statusCode = 400;

      throw error;
   }
   borrowing.endDate = new Date();

   await borrowing.save();
   const book = await Book.findById(
      borrowing.bookId
   );
   if (book) {

      book.available = true;

      await book.save();
   }
   return borrowing;
};

// ===========================================
// My Books
// ===========================================

const getMyBooks = async (userId) => {
   const borrowings = await Borrowing.find({
      userId: userId,
      endDate: null
   }).populate('bookId');

   if (!borrowings || borrowings.length === 0) {
      const error = new Error(
         "No borrowings found"
      );
      error.statusCode = 404;
      throw error;
   }
   return borrowings;
};


// ===========================================
// My History (Returned Books)
// ===========================================

const getMyHistory = async (userId) => {
   const borrowings = await Borrowing.find({
      userId: userId,
      endDate: { $ne: null }
   }).populate('bookId');

   return borrowings;
};


module.exports = {
   borrowBook,
   returnBook,
   getMyBooks,
   getMyHistory
};