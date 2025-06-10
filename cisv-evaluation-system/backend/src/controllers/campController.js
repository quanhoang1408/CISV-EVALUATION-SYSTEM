const Camp = require('../models/Camp');

// @desc    Get all camps
// @route   GET /api/camps
// @access  Public
const getAllCamps = async (req, res) => {
  try {
    console.log('🏕️ Getting all camps...');
    
    const camps = await Camp.find().sort({ createdAt: -1 });
    console.log('📊 Found camps:', camps.length);
    console.log('🔍 Camps data:', camps);
    
    res.status(200).json({
      success: true,
      count: camps.length,
      data: camps
    });
  } catch (error) {
    console.error('❌ Error getting camps:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tải danh sách trại',
      error: error.message
    });
  }
};

const getCampById = async (req, res) => {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ success: false, message: 'Không tìm thấy camp' });
    res.json({ success: true, data: camp });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể tải camp', error: error.message });
  }
};

const createCamp = async (req, res) => {
  try {
    const camp = new Camp(req.body);
    await camp.save();
    res.status(201).json({ success: true, message: 'Tạo camp thành công', data: camp });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể tạo camp', error: error.message });
  }
};

module.exports = { getAllCamps, getCampById, createCamp };
