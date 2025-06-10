const Leader = require('../models/Leader');
const Kid = require('../models/Kid');

const getAllLeaders = async (req, res) => {
  try {
    const leaders = await Leader.find().populate('subcampId', 'name description');
    res.json({ success: true, data: leaders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể tải leaders', error: error.message });
  }
};

const getLeadersBySubcamp = async (req, res) => {
  try {
    const leaders = await Leader.find({ subcampId: req.params.subcampId });

    // Thêm thông tin kids cho mỗi leader
    const leadersWithKids = await Promise.all(
      leaders.map(async (leader) => {
        const kids = await Kid.find({ leaderId: leader._id, isActive: true })
          .select('name age nationality');
        return { ...leader.toObject(), kids };
      })
    );

    res.json({ success: true, data: leadersWithKids });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể tải leaders', error: error.message });
  }
};

const getLeaderWithKids = async (req, res) => {
  try {
    const leader = await Leader.findById(req.params.leaderId);
    if (!leader) return res.status(404).json({ success: false, message: 'Không tìm thấy leader' });

    const kids = await Kid.find({ leaderId: req.params.leaderId, isActive: true });

    res.json({ success: true, data: { ...leader.toObject(), kids } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể tải leader', error: error.message });
  }
};

module.exports = { getAllLeaders, getLeadersBySubcamp, getLeaderWithKids };
