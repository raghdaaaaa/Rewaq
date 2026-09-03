const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
    startDate: {
        type: Date,
        default: Date.now
    },

    endDate: {
        type: Date,
        default: null
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },

    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Books',
        required: true
    }
});

module.exports = mongoose.model('Borrowing', borrowingSchema);