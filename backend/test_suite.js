/**
 * Automated Test Suite for Rewaq Library Backend
 */
require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const express = require('express');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, auth, authorization, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "rewaq-api", timestamp: new Date() });
});

app.use("/books", require("./routes/book_route"));
app.use("/users", require("./routes/user_route"));
app.use("/auth", require("./routes/auth_route"));
app.use("/borrowing", require("./routes/borrowing.route"));
app.use(require("./middlewares/error_handler"));

const TEST_PORT = 5099;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

let server;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('==============================================');
  console.log('  RUNNING REWAQ BACKEND AUTOMATED TEST SUITE  ');
  console.log('==============================================');

  try {
    await mongoose.connect(process.env.mongodb_url);
    console.log('Database connected successfully for tests.');

    server = await new Promise((resolve) => {
      const s = app.listen(TEST_PORT, () => resolve(s));
    });
    console.log(`Test server running on port ${TEST_PORT}\n`);

    const timestamp = Date.now();
    const testAdminEmail = `admin_${timestamp}@rewaq.test`;
    const testUserEmail = `user_${timestamp}@rewaq.test`;

    // 1. Health check
    console.log('[1] Testing Health Check Route');
    const healthRes = await fetch(`${BASE_URL}/health`);
    assert(healthRes.status === 200, 'GET /health returns 200');
    const healthData = await healthRes.json();
    assert(healthData.status === 'ok', 'Health status is "ok"');

    // 2. Auth: Register new user
    console.log('\n[2] Testing User Registration');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Regular Reader',
        email: testUserEmail,
        password: 'Password123',
        phone: `+9665${String(timestamp).slice(-7)}1`,
        role: 'user'
      })
    });
    assert(regRes.status === 201, 'POST /auth/register returns 201 Created');
    const regData = await regRes.json();
    assert(!!regData.token, 'Registration returns JWT token');
    assert(regData.user?.email === testUserEmail, 'Registration returns user object with matching email');
    const userToken = regData.token;

    // 3. Auth: Register Admin user
    console.log('\n[3] Testing Admin Registration');
    const adminRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Library Admin',
        email: testAdminEmail,
        password: 'AdminPassword123',
        phone: `+9665${String(timestamp).slice(-7)}2`,
        role: 'admin'
      })
    });
    assert(adminRegRes.status === 201, 'Admin registration returns 201 Created');
    const adminRegData = await adminRegRes.json();
    assert(adminRegData.user?.role === 'admin', 'Admin user has role "admin"');
    const adminToken = adminRegData.token;

    // 4. Duplicate Registration (Conflict 409)
    console.log('\n[4] Testing Duplicate Registration Handling');
    const dupRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Reader',
        email: testUserEmail,
        password: 'Password123',
        phone: '+966500000003'
      })
    });
    assert(dupRes.status === 409, 'Duplicate email returns 409 Conflict (not 500)');

    // 5. Validation Error Handling (400 Bad Request)
    console.log('\n[5] Testing Validation Error Handling');
    const valRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bad Email User',
        email: 'invalid-email-address',
        password: '123'
      })
    });
    assert(valRes.status === 400, 'Invalid email returns 400 Bad Request (not 500)');

    // 6. Login
    console.log('\n[6] Testing Login');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        password: 'Password123'
      })
    });
    assert(loginRes.status === 200, 'Valid login returns 200 OK');
    const loginData = await loginRes.json();
    assert(!!loginData.token, 'Login returns JWT token');
    assert(!!loginData.user, 'Login returns user object');

    // 7. Standard Authorization Header: Bearer <token>
    console.log('\n[7] Testing Authorization Header Standards');
    const bearerRes = await fetch(`${BASE_URL}/books`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(bearerRes.status === 200, 'GET /books works with "Authorization: Bearer <token>"');

    const authHeaderRes = await fetch(`${BASE_URL}/books`, {
      headers: { 'auth': userToken }
    });
    assert(authHeaderRes.status === 200, 'GET /books works with "auth: <token>"');

    const unauthorizedRes = await fetch(`${BASE_URL}/books`);
    assert(unauthorizedRes.status === 401, 'GET /books without token returns 401 Unauthorized');

    // 8. Borrowing empty state
    console.log('\n[8] Testing Empty Borrowing State');
    const emptyBorrowRes = await fetch(`${BASE_URL}/borrowing/my-books`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(emptyBorrowRes.status === 200, 'GET /borrowing/my-books when empty returns 200 OK (not 404/500)');
    const emptyBorrowData = await emptyBorrowRes.json();
    assert(Array.isArray(emptyBorrowData.borrowings) && emptyBorrowData.borrowings.length === 0, 'Empty borrowings is an empty array');

    // 9. Admin adds a book
    console.log('\n[9] Testing Book Creation by Admin');
    const bookTitle = `Clean Code Architecture ${timestamp}`;
    const addBookRes = await fetch(`${BASE_URL}/books`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: bookTitle,
        author: 'Robert C. Martin',
        pages: 464
      })
    });
    assert(addBookRes.status === 201, 'Admin can create a new book (201 Created)');

    // 10. Non-admin cannot add book
    console.log('\n[10] Testing Admin Privilege Guard');
    const forbiddenAddRes = await fetch(`${BASE_URL}/books`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Hacker Book',
        author: 'Unknown',
        pages: 100
      })
    });
    assert(forbiddenAddRes.status === 403, 'Regular user cannot create books (403 Forbidden)');

    // 11. Search and retrieve book
    console.log('\n[11] Testing Book Retrieval and Search');
    const searchRes = await fetch(`${BASE_URL}/books/search?search=Clean+Code`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(searchRes.status === 200, 'GET /books/search returns 200 OK');
    const searchBooks = await searchRes.json();
    const createdBook = searchBooks.find(b => b.title === bookTitle);
    assert(!!createdBook, 'Created book found in search results');
    const bookId = createdBook._id;

    // 12. Borrow book
    console.log('\n[12] Testing Book Borrowing');
    const borrowRes = await fetch(`${BASE_URL}/borrowing/borrow`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bookId })
    });
    assert(borrowRes.status === 201, 'POST /borrowing/borrow returns 201 Created');
    const borrowData = await borrowRes.json();
    const borrowingId = borrowData.borrowing?._id;
    assert(!!borrowingId, 'Borrowing record created');

    // 13. Verify book is now unavailable and active in my-books
    console.log('\n[13] Testing Borrowing Status Update');
    const checkBookRes = await fetch(`${BASE_URL}/books/${bookId}`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const checkBookData = await checkBookRes.json();
    assert(checkBookData.available === false, 'Borrowed book is marked available: false');

    const myBooksRes = await fetch(`${BASE_URL}/borrowing/my-books`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const myBooksData = await myBooksRes.json();
    assert(myBooksData.borrowings?.length === 1, 'My books now contains 1 active borrow');
    assert(myBooksData.borrowings[0].bookId?.title === bookTitle, 'Borrowed book title populated');

    // 14. Cannot borrow unavailable book
    console.log('\n[14] Testing Re-borrowing Prevention');
    const reBorrowRes = await fetch(`${BASE_URL}/borrowing/borrow`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bookId })
    });
    assert(reBorrowRes.status === 400, 'Cannot borrow already-borrowed book (400 Bad Request)');

    // 15. Return book
    console.log('\n[15] Testing Book Return');
    const returnRes = await fetch(`${BASE_URL}/borrowing/return/${borrowingId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(returnRes.status === 200, 'POST /borrowing/return returns 200 OK');

    const afterReturnBookRes = await fetch(`${BASE_URL}/books/${bookId}`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const afterReturnBookData = await afterReturnBookRes.json();
    assert(afterReturnBookData.available === true, 'Returned book is now available: true');

    // Clean up test data
    console.log('\n[16] Cleaning up test data');
    const BookModel = require('./models/book_model');
    const BorrowingModel = require('./models/borrowing_model');
    const UserModel = require('./models/user_model');

    await BookModel.findByIdAndDelete(bookId);
    await BorrowingModel.findByIdAndDelete(borrowingId);
    await UserModel.deleteMany({ email: { $in: [testUserEmail, testAdminEmail] } });
    console.log('  ✓ Cleaned test records');

    console.log('\n==============================================');
    console.log(`  ALL TESTS PASSED! (${passedTests} passed, ${failedTests} failed) `);
    console.log('==============================================\n');

  } catch (err) {
    console.error('\n❌ Test execution failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(process.exitCode || 0);
  }
}

runTests();
