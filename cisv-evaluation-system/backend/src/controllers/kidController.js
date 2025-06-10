const Kid = require('../models/Kid');
const Leader = require('../models/Leader');

// Lấy tất cả kids
const getAllKids = async (req, res) => {
  try {
    const { page = 1, limit = 50, subcampId, leaderId, ageGroup } = req.query;

    let filter = { isActive: true };

    if (subcampId) filter.subcampId = subcampId;
    if (leaderId) filter.leaderId = leaderId;

    const kids = await Kid.find(filter)
      .populate('subcampId', 'name description color')
      .populate('leaderId', 'name email')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Kid.countDocuments(filter);

    res.json({
      success: true,
      data: kids,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching kids:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách kids',
      error: error.message
    });
  }
};

// Lấy kids theo leader
const getKidsByLeader = async (req, res) => {
  try {
    const { leaderId } = req.params;

    const kids = await Kid.findByLeader(leaderId);

    res.json({
      success: true,
      data: kids,
      count: kids.length
    });
  } catch (error) {
    console.error('Error fetching kids by leader:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách kids của leader',
      error: error.message
    });
  }
};

// Lấy thông tin kid cụ thể
const getKidById = async (req, res) => {
  try {
    const { id } = req.params;

    const kid = await Kid.findById(id)
      .populate('subcampId', 'name description color')
      .populate('leaderId', 'name email');

    if (!kid) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy kid'
      });
    }

    res.json({
      success: true,
      data: kid
    });
  } catch (error) {
    console.error('Error fetching kid:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải thông tin kid',
      error: error.message
    });
  }
};

// Tạo kid mới
const createKid = async (req, res) => {
  try {
    const kidData = req.body;

    // Kiểm tra leader có thể nhận thêm kid không (tối đa 5)
    const leader = await Leader.findById(kidData.leaderId);
    if (!leader) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy leader'
      });
    }

    const currentKidsCount = await Kid.countDocuments({ 
      leaderId: kidData.leaderId, 
      isActive: true 
    });

    if (currentKidsCount >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Leader đã đạt số lượng kids tối đa (5)'
      });
    }

    const kid = new Kid(kidData);
    await kid.save();

    // Cập nhật số lượng kids cho leader
    await Leader.findByIdAndUpdate(kidData.leaderId, {
      kidsCount: currentKidsCount + 1
    });

    const populatedKid = await Kid.findById(kid._id)
      .populate('subcampId', 'name description')
      .populate('leaderId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Đã tạo kid thành công',
      data: populatedKid
    });
  } catch (error) {
    console.error('Error creating kid:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo kid',
      error: error.message
    });
  }
};

// Cập nhật thông tin kid
const updateKid = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const kid = await Kid.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('subcampId', 'name description')
    .populate('leaderId', 'name email');

    if (!kid) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy kid'
      });
    }

    res.json({
      success: true,
      message: 'Đã cập nhật kid thành công',
      data: kid
    });
  } catch (error) {
    console.error('Error updating kid:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật kid',
      error: error.message
    });
  }
};

// Xóa kid (soft delete)
const deleteKid = async (req, res) => {
  try {
    const { id } = req.params;

    const kid = await Kid.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!kid) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy kid'
      });
    }

    // Cập nhật số lượng kids cho leader
    const currentKidsCount = await Kid.countDocuments({ 
      leaderId: kid.leaderId, 
      isActive: true 
    });

    await Leader.findByIdAndUpdate(kid.leaderId, {
      kidsCount: currentKidsCount
    });

    res.json({
      success: true,
      message: 'Đã xóa kid thành công'
    });
  } catch (error) {
    console.error('Error deleting kid:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa kid',
      error: error.message
    });
  }
};

// Lấy thống kê kids theo subcamp
const getKidsStatsBySubcamp = async (req, res) => {
  try {
    const { subcampId } = req.params;

    const stats = await Kid.getEvaluationStats(subcampId);

    res.json({
      success: true,
      data: stats[0] || {
        totalKids: 0,
        completedEvaluations: 0,
        inProgressEvaluations: 0,
        averageProgress: 0
      }
    });
  } catch (error) {
    console.error('Error fetching kids stats:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải thống kê kids',
      error: error.message
    });
  }
};

module.exports = {
  getAllKids,
  getKidsByLeader,
  getKidById,
  createKid,
  updateKid,
  deleteKid,
  getKidsStatsBySubcamp
};
