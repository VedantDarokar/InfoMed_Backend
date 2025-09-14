const express = require('express');
const router = express.Router();
const {
  translate,
  translateBatch,
  getSupportedLanguages
} = require('../controllers/translationController');

// @route   POST /api/translate
// @desc    Translate text
// @access  Public
router.post('/', translate);

// @route   POST /api/translate/batch
// @desc    Translate multiple texts
// @access  Public
router.post('/batch', translateBatch);

// @route   GET /api/translate/languages
// @desc    Get supported languages
// @access  Public
router.get('/languages', getSupportedLanguages);

module.exports = router;
