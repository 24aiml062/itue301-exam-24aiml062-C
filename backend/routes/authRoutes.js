const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { authGuard } = require('../middleware/authGuard');

// Public route
router.post('/login', login);

// Protected route
router.get('/me', authGuard, getMe);

module.exports = router;
