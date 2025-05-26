// src/utils/jwtHelper.js
// JWT token generation and verification utilities
const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateToken = (payload, expiresIn = config.jwtExpiry) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '30d' });
};

const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken,
  extractTokenFromHeader
};