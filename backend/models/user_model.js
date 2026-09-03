const mongoose = require("mongoose");

const minPassLength = Number(process.env.pass_min) || 6;

const usersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [/^[\w.-]+@[\w.-]+\.\w+$/, "Invalid email format"],
    unique: true,
  },

  password: {
    type: String,
    required: [true, "Password is required."],
    minlength: [
      minPassLength,
      `Password must be at least ${minPassLength} characters`,
    ],
  },

  phone: {
    type: String,
    trim: true,
    match: [/^\+?[0-9]{8,15}$/, "Invalid phone format"],
    unique: true,
    sparse: true,
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  tokenVersion: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Users", usersSchema);

// ----------- testing template
// {
//     "name": "",
//     "email": "",
//     "password": "",
//     "phone": ""
// }
