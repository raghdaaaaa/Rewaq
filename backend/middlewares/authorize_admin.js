const Book = require('../models/book_model');

const authorizer = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (req.user.role !== "admin") {
            return res.status(403).json({
                msg: "Forbidden"
            });
        }
        
        next();
        }
    catch (error) {
        next(error);
    }
};

module.exports = authorizer;