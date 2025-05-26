// src/routes/favoriteRoutes.js
// User favorites management endpoints
const express = require('express');
const {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite
} = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getFavorites);
router.post('/:propertyId', authenticate, addToFavorites);
router.delete('/:propertyId', authenticate, removeFromFavorites);
router.get('/check/:propertyId', authenticate, checkFavorite);

module.exports = router;