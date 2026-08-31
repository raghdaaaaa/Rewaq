require('dotenv').config({
   path: './config.env'
});

const express = require('express');
const mongoose = require('mongoose');

const app = express();


// ===================================
// JSON Middleware
// ===================================

app.use(express.json());


// ===================================
// Routes
// ===================================

const bookRoute = require('./routes/book.route');
const userRoute = require('./routes/user.route');
const authRoute = require('./routes/auth.route');
const borrowingRoute = require('./routes/borrowing.routes');


// Books
app.use('/books', bookRoute);

// Users
app.use('/users', userRoute);

// Authentication
app.use('/auth', authRoute);

// Borrowing
app.use('/borrowing', borrowingRoute);


// ===================================
// Error Handler
// ===================================

const errorHandler = require('./middlewares/error_handler');

app.use(errorHandler);


// ===================================
// Database
// ===================================

mongoose.connect(process.env.mongodb_url)
   .then(() => {
      console.log('DATABASE CONNECTED');
   })
   .catch((error) => {
      console.log(`DATABASE ERROR:\n${error}`);
   });


// ===================================
// Server
// ===================================

const port = process.env.server_port;
const serverUrl = process.env.server_url;

app.listen(port, serverUrl, () => {
   console.log(`SERVER LISTENING ON PORT ${port}`);
});