const Camp = require('../models/Camp');

const getAllCamps = async (req, res) => {
  try {
    const camps = await Camp.find().sort({ startDate: -1 });
    res.json({ success: true, data: camps });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể tải camps', error: error.message });
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
