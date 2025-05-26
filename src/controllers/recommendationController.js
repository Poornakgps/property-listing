// src/controllers/recommendationController.js
// Property recommendation system between users with email notifications
const Recommendation = require('../models/Recommendation');
const Property = require('../models/Property');
const User = require('../models/User');
const emailService = require('../services/emailService');
const { asyncHandler } = require('../utils/asyncHandler');

const sendRecommendation = asyncHandler(async (req, res) => {
  const { propertyId, recipientEmail, message } = req.body;
  const senderId = req.user.id;

  const property = await Property.findById(propertyId).populate('createdBy', 'name');
  if (!property) {
    return res.status(404).json({
      success: false,
      error: 'Property not found'
    });
  }

  const recipient = await User.findOne({ email: recipientEmail });
  if (!recipient) {
    return res.status(404).json({
      success: false,
      error: 'Recipient user not found'
    });
  }

  if (recipient._id.toString() === senderId.toString()) {
    return res.status(400).json({
      success: false,
      error: 'Cannot recommend property to yourself'
    });
  }

  const existingRecommendation = await Recommendation.findOne({
    property: propertyId,
    sender: senderId,
    recipient: recipient._id
  });

  if (existingRecommendation) {
    return res.status(400).json({
      success: false,
      error: 'Property already recommended to this user'
    });
  }

  const recommendation = new Recommendation({
    property: propertyId,
    sender: senderId,
    recipient: recipient._id,
    message
  });

  await recommendation.save();

  if (emailService.isAvailable()) {
    try {
      await emailService.sendPropertyRecommendation(
        recipientEmail,
        req.user.name,
        property,
        message
      );
    } catch (error) {
      console.error('Failed to send recommendation email:', error);
    }
  }

  res.status(201).json({
    success: true,
    message: 'Property recommendation sent successfully',
    data: { recommendation }
  });
});

const getReceivedRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, status } = req.query;

  let query = { recipient: userId };
  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const recommendations = await Recommendation.find(query)
    .populate('sender', 'name email')
    .populate({
      path: 'property',
      populate: {
        path: 'createdBy',
        select: 'name email'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Recommendation.countDocuments(query);

  res.json({
    success: true,
    data: {
      recommendations,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    }
  });
});

const getSentRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const recommendations = await Recommendation.find({ sender: userId })
    .populate('recipient', 'name email')
    .populate('property', 'title type price city state')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Recommendation.countDocuments({ sender: userId });

  res.json({
    success: true,
    data: {
      recommendations,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    }
  });
});

const markAsViewed = asyncHandler(async (req, res) => {
  const { recommendationId } = req.params;
  const userId = req.user.id;

  const recommendation = await Recommendation.findOneAndUpdate(
    { _id: recommendationId, recipient: userId, status: 'sent' },
    { status: 'viewed', viewedAt: new Date() },
    { new: true }
  );

  if (!recommendation) {
    return res.status(404).json({
      success: false,
      error: 'Recommendation not found or already processed'
    });
  }

  res.json({
    success: true,
    message: 'Recommendation marked as viewed',
    data: { recommendation }
  });
});

const respondToRecommendation = asyncHandler(async (req, res) => {
  const { recommendationId } = req.params;
  const { action } = req.body;
  const userId = req.user.id;

  if (!['favorited', 'ignored'].includes(action)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid action. Must be "favorited" or "ignored"'
    });
  }

  const recommendation = await Recommendation.findOneAndUpdate(
    { _id: recommendationId, recipient: userId },
    { status: action, respondedAt: new Date() },
    { new: true }
  );

  if (!recommendation) {
    return res.status(404).json({
      success: false,
      error: 'Recommendation not found'
    });
  }

  res.json({
    success: true,
    message: `Recommendation marked as ${action}`,
    data: { recommendation }
  });
});

module.exports = {
  sendRecommendation,
  getReceivedRecommendations,
  getSentRecommendations,
  markAsViewed,
  respondToRecommendation
};