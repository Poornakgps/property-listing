// src/routes/authRoutes.js
// Authentication route definitions with validation and rate limiting
const express = require('express');
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword 
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, userRegistrationSchema, userLoginSchema } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, validate(userRegistrationSchema), register);
router.post('/login', authLimiter, validate(userLoginSchema), login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

module.exports = router;