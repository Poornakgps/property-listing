// src/controllers/propertyController.js
// Property CRUD endpoints with search, filtering, and ownership validation
const propertyService = require('../services/propertyService');
const csvImportService = require('../services/csvImportService');
const { asyncHandler } = require('../utils/asyncHandler');

const createProperty = asyncHandler(async (req, res) => {
  const property = await propertyService.createProperty(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: 'Property created successfully',
    data: { property }
  });
});

const getProperties = asyncHandler(async (req, res) => {
  const result = await propertyService.getProperties(req.query);

  res.json({
    success: true,
    data: result
  });
});

const getPropertyById = asyncHandler(async (req, res) => {
  const property = await propertyService.getPropertyById(req.params.id);

  res.json({
    success: true,
    data: { property }
  });
});

const updateProperty = asyncHandler(async (req, res) => {
  const property = await propertyService.updateProperty(req.params.id, req.body, req.user.id);

  res.json({
    success: true,
    message: 'Property updated successfully',
    data: { property }
  });
});

const deleteProperty = asyncHandler(async (req, res) => {
  await propertyService.deleteProperty(req.params.id, req.user.id);

  res.json({
    success: true,
    message: 'Property deleted successfully'
  });
});

const getUserProperties = asyncHandler(async (req, res) => {
  const result = await propertyService.getUserProperties(req.user.id, req.query);

  res.json({
    success: true,
    data: result
  });
});

const getFilterOptions = asyncHandler(async (req, res) => {
  const options = await propertyService.getFilterOptions();

  res.json({
    success: true,
    data: options
  });
});

const importPropertiesFromCSV = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No CSV file uploaded'
    });
  }

  await csvImportService.validateCSVFormat(req.file.path);
  const result = await csvImportService.importProperties(req.file.path, req.user.id);

  res.json({
    success: true,
    message: 'CSV import completed',
    data: result
  });
});

const getImportStats = asyncHandler(async (req, res) => {
  const stats = await csvImportService.getImportStats();

  res.json({
    success: true,
    data: stats
  });
});

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getUserProperties,
  getFilterOptions,
  importPropertiesFromCSV,
  getImportStats
};