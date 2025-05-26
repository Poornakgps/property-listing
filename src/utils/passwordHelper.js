// src/utils/passwordHelper.js
// Password hashing and validation utilities
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const validatePasswordStrength = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

  return {
    isValid: errors.length === 0 && strengthScore >= 2,
    errors,
    strengthScore,
    strength: strengthScore <= 1 ? 'weak' : strengthScore <= 2 ? 'medium' : 'strong'
  };
};

module.exports = {
  hashPassword,
  comparePassword,
  generateResetToken,
  validatePasswordStrength
};