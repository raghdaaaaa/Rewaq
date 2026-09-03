const User = require('../models/user_model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


// Register

const register = async (data) => {

    const {
        name,
        email,
        password,
        phone
    } = data;


    if (!password || password.length < Number(process.env.pass_min)) {
        const error = new Error(
            `Password must be at least ${process.env.pass_min} characters`
        );

        error.statusCode = 400;

        throw error;
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const user = new User({
        name,
        email,
        password: hashedPassword,
        phone
    });


    await user.save();


    const token = jwt.sign(
        {
            name: user.name,
            email: user.email,
            id: user._id,
            role: user.role,
            tokenVersion: user.tokenVersion
        },
        process.env.secret_key
    );


    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        },
        token
    };
};


// Login 

const login = async (data) => {

    const {
        email,
        password
    } = data;


    const user = await User.findOne({
        email
    });


    if (!user) {
        const error = new Error(
            "Invalid email or password"
        );

        error.statusCode = 400;

        throw error;
    }


    const passwordCorrect = await bcrypt.compare(
        password,
        user.password
    );


    if (!passwordCorrect) {
        const error = new Error(
            "Invalid email or password"
        );

        error.statusCode = 400;

        throw error;
    }


    const token = jwt.sign(
        {
            name: user.name,
            email: user.email,
            id: user._id,
            role: user.role,
            tokenVersion: user.tokenVersion
        },
        process.env.secret_key
    );


    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        },
        token
    };
};


module.exports = {
    register,
    login
};