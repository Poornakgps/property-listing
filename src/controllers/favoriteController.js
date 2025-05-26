// src/controllers/favoriteController.js
// User favorites management with caching support
const Favorite = require('../models/Favorite');
const Property = require('../models/Property');
const cacheService = require('../services/cacheService');
const { asyncHandler } = require('../utils/asyncHandler');

const addToFavorites = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const userId = req.user.id;

  const property = await Property.findById(propertyId);
  if (!property) {
    return res.status(404).json({
      success: false,
      error: 'Property not found'
    });
  }

  const existingFavorite = await Favorite.findOne({ user: userId, property: propertyId });
  if (existingFavorite) {
    return res.status(400).json({
      success: false,
      error: 'Property already in favorites'
    });
  }

  const favorite = new Favorite({
    user: userId,
    property: propertyId
  });

  await favorite.save();
  await cacheService.clearUserCache(userId);

  res.status(201).json({
    success: true,
    message: 'Property added to favorites',
    data: { favorite }
  });
});

const removeFromFavorites = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const userId = req.user.id;

  const favorite = await Favorite.findOneAndDelete({
    user: userId,
    property: propertyId
  });

  if (!favorite) {
    return res.status(404).json({
      success: false,
      error: 'Property not in favorites'
    });
  }

  await cacheService.clearUserCache(userId);

  res.json({
    success: true,
    message: 'Property removed from favorites'
  });
});

const getFavorites = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20 } = req.query;

  const cached = await cacheService.getUserFavorites(userId);
  if (cached) {
    return res.json({
      success: true,
      data: cached
    });
  }

  const skip = (page - 1) * limit;

  const favorites = await Favorite.find({ user: userId })
    .populate({
      path: 'property',
      populate: {
        path: 'createdBy',
        select: 'name email'
      }
    })
    .sort({ addedAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Favorite.countDocuments({ user: userId });

  const result = {
    favorites,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: Number(limit)
    }
  };

  await cacheService.setUserFavorites(userId, result);

  res.json({
    success: true,
    data: result
  });
});

const checkFavorite = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const userId = req.user.id;

  const favorite = await Favorite.findOne({
    user: userId,
    property: propertyId
  });

  res.json({
    success: true,
    data: { isFavorite: !!favorite }
  });
});

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite
};