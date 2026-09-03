const Borrowing = require('../models/borrowing_model');
const Book = require('../models/book_model');



// Borrow Book

const borrowBook = async (userId, bookId) => {
   const book = await Book.findById(bookId);

   if (!book) {
      const error = new Error("Book does not exist");
      error.statusCode = 404;
      throw error;
   }

   if (!book.available) {
      const error = new Error("Book is not currently available for borrowing");
      error.statusCode = 400;
      throw error;
   }

   const alreadyBorrowed = await Borrowing.findOne({
      userId,
      bookId,
      endDate: null
   });

   if (alreadyBorrowed) {
      const error = new Error("You currently have an active borrow for this book");
      error.statusCode = 400;
      throw error;
   }

   const borrowing = await Borrowing.create({
      userId,
      bookId,
      startDate: new Date(),
      endDate: null
   });

   book.available = false;
   await book.save();

   return await Borrowing.findById(borrowing._id).populate({
      path: 'bookId',
      select: '-coverImage.data'
   });
};



// Return Book

const returnBook = async (userId, borrowingId) => {
   const borrowing = await Borrowing.findById(borrowingId);

   if (!borrowing) {
      const error = new Error("Borrowing record does not exist");
      error.statusCode = 404;
      throw error;
   }

   if (borrowing.userId.toString() !== userId.toString()) {
      const error = new Error("You are not authorized to return this book");
      error.statusCode = 403;
      throw error;
   }

   if (borrowing.endDate) {
      const error = new Error("Book is already returned");
      error.statusCode = 400;
      throw error;
   }

   borrowing.endDate = new Date();
   await borrowing.save();

   const book = await Book.findById(borrowing.bookId);
   if (book) {
      book.available = true;
      await book.save();
   }

   return await Borrowing.findById(borrowing._id).populate({
      path: 'bookId',
      select: '-coverImage.data'
   });
};

// My Books

const getMyBooks = async (userId) => {
   const borrowings = await Borrowing.find({
      userId: userId,
      endDate: null
   })
      .populate({
         path: 'bookId',
         select: '-coverImage.data'
      })
      .sort({ startDate: -1 });

   return borrowings || [];
};


module.exports = {
   borrowBook,
   returnBook,
   getMyBooks
};