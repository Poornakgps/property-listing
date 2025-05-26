// src/routes/propertyRoutes.js
// Property management routes with search, filtering, and CSV import
const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getUserProperties,
  getFilterOptions,
  importPropertiesFromCSV,
  getImportStats
} = require('../controllers/propertyController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, propertySchema, propertyUpdateSchema } = require('../middleware/validation');
const { searchLimiter, uploadLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.get('/', optionalAuth, searchLimiter, getProperties);
router.get('/filters', getFilterOptions);
router.get('/my-properties', authenticate, getUserProperties);
router.get('/stats', getImportStats);
router.get('/:id', optionalAuth, getPropertyById);

router.post('/', authenticate, validate(propertySchema), createProperty);
router.post('/import', authenticate, uploadLimiter, upload.single('csvFile'), importPropertiesFromCSV);

router.put('/:id', authenticate, validate(propertyUpdateSchema), updateProperty);
router.delete('/:id', authenticate, deleteProperty);

module.exports = router;