require('dotenv').config({
    path: './config.env'
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const bookRoute = require('./routes/book_route');
const userRoute = require('./routes/user_route');
const authRoute = require('./routes/auth_route');
const borrowingRoute = require('./routes/borrowing.route');

app.use('/books', bookRoute);
app.use('/users', userRoute);
app.use('/auth', authRoute);
app.use('/borrowing', borrowingRoute);

// Error Handler
const errorHandler = require('./middlewares/error_handler');
app.use(errorHandler);

// Database
mongoose.connect(process.env.mongodb_url)
    .then(() => {
        console.log('DATABASE CONNECTED');
    })
    .catch((error) => {
        console.log(`DATABASE ERROR:\n${error}`);
    });

// Server
const port = process.env.server_port;
const server_url = process.env.server_url;

app.listen(port, server_url, () => {
    console.log(`SERVER LISTENING ON PORT ${port}`);
});