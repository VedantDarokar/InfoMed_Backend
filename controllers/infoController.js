const InfoRecord = require('../models/InfoRecord');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// @desc    Create new info record with QR code
// @route   POST /api/info
// @access  Private
const createInfoRecord = async (req, res) => {
  try {
    const { 
      medicineName, usage, dosage, exp, man, price, btno, 
      compName, instr, drugs 
    } = req.body;
    const adminId = req.admin?._id;

    // Basic validation - let mongoose handle detailed validation
    if (!medicineName || !usage || !dosage) {
      return res.status(400).json({
        success: false,
        message: 'Medicine name, usage, and dosage are required'
      });
    }

    // Generate unique ID for the record
    const uniqueId = uuidv4();

    // Generate URL that the QR code will point to
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrCodeUrl = `${frontendUrl}/view/${uniqueId}`;

    // Generate QR code as data URL (Base64)
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // Create info record
    const infoRecord = await InfoRecord.create({
      medicineName,
      usage,
      dosage,
      exp,
      man,
      price,
      btno,
      compName,
      instr,
      drugs,
      adminId,
      qrCodeUrl,
      uniqueId,
      qrCodeImage: qrCodeDataUrl // store base64 in DB also
    });

    res.status(201).json({
      success: true,
      message: 'Info record created successfully',
      data: {
        infoRecord,
        qrCodeUrl,
        qrCodeDataUrl
      }
    });
  } catch (error) {
    console.error('Create info record error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating info record'
    });
  }
};

// @desc    Get all info records for logged-in admin
// @route   GET /api/info
// @access  Private
const getAdminInfoRecords = async (req, res) => {
  try {
    const adminId = req.admin?._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const infoRecords = await InfoRecord.find({ adminId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InfoRecord.countDocuments({ adminId });

    res.status(200).json({
      success: true,
      data: {
        infoRecords,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get admin info records error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching info records'
    });
  }
};

// @desc    Get info record by unique ID (for public viewing)
// @route   GET /api/info/view/:uniqueId
// @access  Public
const getInfoRecordByUniqueId = async (req, res) => {
  try {
    const { uniqueId } = req.params;

    const infoRecord = await InfoRecord.findOne({ uniqueId, isActive: true })
      .populate('adminId', 'name email');

    if (!infoRecord) {
      return res.status(404).json({
        success: false,
        message: 'Info record not found or inactive'
      });
    }

    // Increment view count safely
    if (typeof infoRecord.incrementView === 'function') {
      await infoRecord.incrementView();
    }

    res.status(200).json({
      success: true,
      data: {
        infoRecord,
        qrCodeImage: infoRecord.qrCodeImage, // Include QR code image for viewing
        qrCodeUrl: infoRecord.qrCodeUrl // Include QR code URL
      }
    });
  } catch (error) {
    console.error('Get info record by unique ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching info record'
    });
  }
};

// @desc    Update info record
// @route   PUT /api/info/:id
// @access  Private
const updateInfoRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      medicineName, usage, dosage, exp, man, price, btno, 
      compName, instr, drugs 
    } = req.body;
    const adminId = req.admin?._id;

    const infoRecord = await InfoRecord.findOne({ _id: id, adminId });

    if (!infoRecord) {
      return res.status(404).json({
        success: false,
        message: 'Info record not found or you do not have permission to update it'
      });
    }

    // Update fields
    infoRecord.medicineName = medicineName || infoRecord.medicineName;
    infoRecord.usage = usage || infoRecord.usage;
    infoRecord.dosage = dosage || infoRecord.dosage;
    infoRecord.exp = exp || infoRecord.exp;
    infoRecord.man = man || infoRecord.man;
    infoRecord.price = price || infoRecord.price;
    infoRecord.btno = btno || infoRecord.btno;
    infoRecord.compName = compName || infoRecord.compName;
    infoRecord.instr = instr || infoRecord.instr;
    infoRecord.drugs = drugs || infoRecord.drugs;

    await infoRecord.save();

    res.status(200).json({
      success: true,
      message: 'Info record updated successfully',
      data: {
        infoRecord
      }
    });
  } catch (error) {
    console.error('Update info record error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating info record'
    });
  }
};

// @desc    Delete info record
// @route   DELETE /api/info/:id
// @access  Private
const deleteInfoRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin?._id;

    const infoRecord = await InfoRecord.findOneAndDelete({ _id: id, adminId });

    if (!infoRecord) {
      return res.status(404).json({
        success: false,
        message: 'Info record not found or you do not have permission to delete it'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Info record deleted successfully'
    });
  } catch (error) {
    console.error('Delete info record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting info record'
    });
  }
};

// @desc    Toggle info record active status
// @route   PATCH /api/info/:id/toggle
// @access  Private
const toggleInfoRecordStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin?._id;

    const infoRecord = await InfoRecord.findOne({ _id: id, adminId });

    if (!infoRecord) {
      return res.status(404).json({
        success: false,
        message: 'Info record not found or you do not have permission to modify it'
      });
    }

    infoRecord.isActive = !infoRecord.isActive;
    await infoRecord.save();

    res.status(200).json({
      success: true,
      message: `Info record ${infoRecord.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        infoRecord
      }
    });
  } catch (error) {
    console.error('Toggle info record status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling info record status'
    });
  }
};

module.exports = {
  createInfoRecord,
  getAdminInfoRecords,
  getInfoRecordByUniqueId,
  updateInfoRecord,
  deleteInfoRecord,
  toggleInfoRecordStatus
};
