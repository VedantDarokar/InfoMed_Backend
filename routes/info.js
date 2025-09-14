const express = require('express');
const router = express.Router();
const {
  createInfoRecord,
  getAdminInfoRecords,
  getInfoRecordByUniqueId,
  updateInfoRecord,
  deleteInfoRecord,
  toggleInfoRecordStatus
} = require('../controllers/infoController');
const auth = require('../middleware/auth');

// @route   POST /api/info
// @desc    Create new info record with QR code
// @access  Private
router.post('/', auth, createInfoRecord);

// @route   GET /api/info
// @desc    Get all info records for logged-in admin
// @access  Private
router.get('/', auth, getAdminInfoRecords);

// @route   GET /api/info/view/:uniqueId
// @desc    Get info record by unique ID (for public viewing)
// @access  Public
router.get('/view/:uniqueId', getInfoRecordByUniqueId);

// @route   PUT /api/info/:id
// @desc    Update info record
// @access  Private
router.put('/:id', auth, updateInfoRecord);

// @route   DELETE /api/info/:id
// @desc    Delete info record
// @access  Private
router.delete('/:id', auth, deleteInfoRecord);

// @route   PATCH /api/info/:id/toggle
// @desc    Toggle info record active status
// @access  Private
router.patch('/:id/toggle', auth, toggleInfoRecordStatus);

module.exports = router;
