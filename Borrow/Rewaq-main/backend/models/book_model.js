const mongoose = require('mongoose');

const booksSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"]
    },

    author: {
        type: String,
        required: [true, "Author is required"]
    },

    available: {
        type: Boolean,
        default: true
    },

    pages: {
        type: Number,
        min: [1, "Pages must be at least equal to 1"]
    },

    synopsis: {
        type: String,
        trim: true
    },

    category: {
        type: String,
        trim: true,
        default: "ARCHITECTURE & DESIGN"
    },

    publishedYear: {
        type: Number
    },

    isbn: {
        type: String,
        trim: true
    },

    coverImage: {
        data: Buffer,
        contentType: String
    }
});

module.exports = mongoose.model("Books", booksSchema);

// ----------- testing template
// {
//     "title": "",
//     "author": "",
//     "pages":  
// }