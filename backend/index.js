require("dotenv").config({
  path: "./config.env",
});

const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

// CORS Middleware للسماح للفرونت إند (Angular) بالاتصال بالباك إند بدون مشاكل
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, auth, authorization, Authorization",
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "rewaq-api", timestamp: new Date() });
});

// Routes
const bookRoute = require("./routes/book_route");
const userRoute = require("./routes/user_route");
const authRoute = require("./routes/auth_route");
const borrowingRoute = require("./routes/borrowing.route");

app.use("/books", bookRoute);
app.use("/users", userRoute);
app.use("/auth", authRoute);
app.use("/borrowing", borrowingRoute);

// Error Handler
const errorHandler = require("./middlewares/error_handler");
app.use(errorHandler);

// Database
mongoose
  .connect(process.env.mongodb_url)
  .then(() => {
    console.log("DATABASE CONNECTED");
  })
  .catch((error) => {
    console.log(`DATABASE ERROR:\n${error}`);
  });

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// Server
const port = process.env.server_port || 5000;

app.listen(port, "0.0.0.0", () => {
  console.log(`SERVER LISTENING ON PORT ${port}`);
});

