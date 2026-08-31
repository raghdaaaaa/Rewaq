// cmd commands used:
//     1. npm init -y
//     2. npm i mongoose express dotenv multer jsonwebtoken bcrypt
//     3. npm install-scripts approve bcrypt@6.0.0

require('dotenv').config({
    path: './config.env'
});

const express = require('express');
const app = express();
app.use(express.json());

// ----------------------------------- routes:
const bookRoute = require('./routes/book_route');
const userRoute = require('./routes/user_route');
const authRoute = require('./routes/auth_route');

// ----------------------------------- middlewares: 
app.use('/books', bookRoute);
app.use('/users', userRoute);
app.use('/auth', authRoute);
const errorHandler = require('./middlewares/error_handler');
app.use(errorHandler);

// ----------------------------------- server: 
const port = process.env.server_port;
const server_url = process.env.server_url;

app.listen(port, server_url, () => {
    console.log(`SERVER LISTENING ON PORT ${port}`)
});

// ----------------------------------- database: 
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/lab100')
    .then(() => {
        console.log("DATABSE CONNECTED");
    })
    .catch ((error) => {
        console.log(`DATABSE ERROR:\n${error}`)
    });