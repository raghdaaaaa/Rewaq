const borrowingService =
   require('../services/borrowing.service');


// ===========================================
// Borrow
// ===========================================

const borrowBook = async (req, res, next) => {

   try {

      const {
         bookId
      } = req.body;


      const userId = req.user.id;


      const borrowing =
         await borrowingService.borrowBook(
            userId,
            bookId
         );


      res.status(201).json({
         msg: "Book borrowed successfully",
         borrowing
      });

   } catch (error) {

      next(error);

   }
};


// ===========================================
// Return
// ===========================================

const returnBook = async (req, res, next) => {

   try {

      const borrowingId =
         req.params.borrowingId;


      const userId = req.user.id;


      const borrowing =
         await borrowingService.returnBook(
            userId,
            borrowingId
         );


      res.status(200).json({
         msg: "Book returned successfully",
         borrowing
      });

   } catch (error) {

      next(error);

   }
};

// ===========================================
// My Books
// ===========================================

const getMyBooks = async (req, res, next) => {

   try {
      const userId = req.user.id;

      const borrowings =
         await borrowingService.getMyBooks(
            userId
         );
      res.status(200).json({
         msg: "My borrowed books",
         borrowings
      });
   }
   catch (error) {

      next(error);
   }
};




module.exports = {
   borrowBook,
   returnBook,
   getMyBooks
};