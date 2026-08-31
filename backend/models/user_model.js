const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Name is required"]
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        match: [
            /^[\w.-]+@[\w.-]+\.\w+$/,
            "Invalid email format"
        ],
        unique: [true, "Email is already registered"]
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [
            process.env.pass_min,
            `Password must be at least ${process.env.pass_min} characters`
        ]
    },

    phone: {
        type: String,
        required: [true, "Phone is required"],
        match: [
            /^01[0125]\d{8}$/,
            "Invalid phone format"
        ],
        unique: [true, "Phone is already registered"]
    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }

});

module.exports = mongoose.model("Users", usersSchema);