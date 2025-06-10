const Subcamp = require('../models/Subcamp');

const getAllSubcamps = async (req, res) => {
  try {
    const subcamps = await Subcamp.find().populate('campId', 'name');
    res.json({ success: true, data: subcamps });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể tải subcamps', error: error.message });
  }
};

const getSubcampsByCamp = async (req, res) => {
  try {
    const subcamps = await Subcamp.find({ campId: req.params.campId });
    res.json({ success: true, data: subcamps });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể tải subcamps', error: error.message });
  }
};

const createSubcamp = async (req, res) => {
  try {
    const subcamp = new Subcamp(req.body);
    await subcamp.save();
    res.status(201).json({ success: true, message: 'Tạo subcamp thành công', data: subcamp });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể tạo subcamp', error: error.message });
  }
};

module.exports = { getAllSubcamps, getSubcampsByCamp, createSubcamp };
