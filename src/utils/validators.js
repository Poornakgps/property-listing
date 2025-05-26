// src/utils/validators.js
// Common validation functions for data integrity
const mongoose = require('mongoose');

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
};

const isValidPrice = (price) => {
  return typeof price === 'number' && price >= 0;
};

const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date.getTime());
};

const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

const validateCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
};

module.exports = {
  isValidObjectId,
  isValidEmail,
  isValidPhone,
  isValidPrice,
  isValidDate,
  sanitizeString,
  validateCoordinates
};