// src/controllers/authController.js
// Authentication endpoints for user registration, login, and profile management
const authService = require('../services/authService');
const emailService = require('../services/emailService');
const { asyncHandler } = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);

  if (emailService.isAvailable()) {
    emailService.sendWelcomeEmail(user.email, user.name).catch(console.error);
  }

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user, token }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login(email, password);

  res.json({
    success: true,
    message: 'Login successful',
    data: { user, token }
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);

  res.json({
    success: true,
    data: { user }
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};