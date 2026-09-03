const User = require("../models/user_model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.register = async (req, res, next) => {
  try {
    let {
      name,
      email,
      password,
      phone,
      role,
    } = req.body;

    if (!password) {
      return res.status(400).json({
        msg: "Password is required",
      });
    }

    if (email) {
      email = email.toLowerCase().trim();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name ? name.trim() : undefined,
      email,
      password: hashedPassword,
      phone: phone ? phone.trim() : undefined,
      role: role === "admin" ? "admin" : "user",
    });

    await user.save();

    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
        id: user._id,
        role: user.role,
        tokenVersion: user.tokenVersion,
      },
      process.env.secret_key,
      { expiresIn: "7d" }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      user: userResponse,
      token: token,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        msg: "Email and password are required",
      });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        msg: "Invalid email or password",
      });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({
        msg: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
        id: user._id,
        role: user.role,
        tokenVersion: user.tokenVersion,
      },
      process.env.secret_key,
      { expiresIn: "7d" }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};
