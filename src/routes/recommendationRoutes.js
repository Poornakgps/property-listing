// src/routes/recommendationRoutes.js
// Property recommendation endpoints for sharing between users
const express = require('express');
const {
  sendRecommendation,
  getReceivedRecommendations,
  getSentRecommendations,
  markAsViewed,
  respondToRecommendation
} = require('../controllers/recommendationController');
const { authenticate } = require('../middleware/auth');
const { validate, recommendationSchema } = require('../middleware/validation');

const router = express.Router();

router.post('/', authenticate, validate(recommendationSchema), sendRecommendation);
router.get('/received', authenticate, getReceivedRecommendations);
router.get('/sent', authenticate, getSentRecommendations);
router.put('/:recommendationId/viewed', authenticate, markAsViewed);
router.put('/:recommendationId/respond', authenticate, respondToRecommendation);

module.exports = router;