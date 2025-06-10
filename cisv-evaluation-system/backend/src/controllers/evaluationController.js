const Evaluation = require('../models/Evaluation');
const Kid = require('../models/Kid');
const Leader = require('../models/Leader');
const Question = require('../models/Question');
const Subcamp = require('../models/Subcamp');

// Lấy tất cả đánh giá của một leader
const getEvaluationsByLeader = async (req, res) => {
  try {
    const { leaderId } = req.params;

    const evaluations = await Evaluation.findByLeader(leaderId);

    res.json({
      success: true,
      data: evaluations,
      count: evaluations.length
    });
  } catch (error) {
    console.error('Error fetching evaluations by leader:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách đánh giá',
      error: error.message
    });
  }
};

// Auto-save đánh giá (được gọi mỗi 30 giây)
const autoSaveEvaluation = async (req, res) => {
  try {
    const { leaderId, evaluations, timestamp } = req.body;

    if (!leaderId || !evaluations || Object.keys(evaluations).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ'
      });
    }

    // Chuyển đổi evaluations object thành array
    const evaluationArray = Object.values(evaluations).map(eval => ({
      leaderId: eval.leaderId,
      kidId: eval.kidId,
      questionId: eval.questionId,
      subcampId: eval.subcampId,
      rating: eval.rating || 0,
      comment: eval.comment || '',
      isCompleted: eval.rating && eval.rating > 0,
      lastModified: eval.lastModified || new Date(),
      autoSaveData: {
        sessionId: req.sessionID || 'unknown',
        deviceInfo: req.get('User-Agent') || 'unknown',
        ipAddress: req.ip
      }
    }));

    // Bulk save
    const result = await Evaluation.bulkSave(evaluationArray);

    res.json({
      success: true,
      message: 'Đã lưu tự động',
      savedCount: result.modifiedCount + result.upsertedCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error auto-saving evaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lưu tự động',
      error: error.message
    });
  }
};

// Submit đánh giá cuối cùng
const submitEvaluation = async (req, res) => {
  try {
    console.log('📤 Submit evaluation request received:', {
      body: req.body,
      headers: req.headers['content-type']
    });

    const { leaderId, subcampId, campId, evaluations } = req.body;

    console.log('📋 Processing submission data:', {
      leaderId,
      subcampId,
      campId,
      evaluationsCount: evaluations?.length || 0
    });

    if (!leaderId || !evaluations || evaluations.length === 0) {
      console.log('❌ Validation failed: Missing required data');
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ'
      });
    }

    // Validate: check if all required evaluations are completed
    const incompleteEvaluations = evaluations.filter(eval => !eval.rating || eval.rating === 0);
    if (incompleteEvaluations.length > 0) {
      console.log('❌ Validation failed: Incomplete evaluations:', incompleteEvaluations.length);
      return res.status(400).json({
        success: false,
        message: 'Vui lòng hoàn thành tất cả đánh giá trước khi nộp',
        incompleteCount: incompleteEvaluations.length
      });
    }

    // Bulk save với flag submitted
    const evaluationArray = evaluations.map(eval => ({
      ...eval,
      isCompleted: true,
      submittedAt: eval.submittedAt || new Date()
    }));

    console.log('💾 Attempting bulk save with', evaluationArray.length, 'evaluations');
    const result = await Evaluation.bulkSave(evaluationArray);
    console.log('✅ Bulk save result:', {
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      matchedCount: result.matchedCount
    });

    // Update leader status
    console.log('👨‍🏫 Updating leader status for:', leaderId);
    await Leader.findByIdAndUpdate(leaderId, {
      'evaluationProgress.status': 'completed',
      'evaluationProgress.submittedAt': new Date()
    });
    console.log('✅ Leader status updated');

    // Update subcamp stats
    console.log('🏘️ Updating subcamp stats for:', subcampId);
    await updateSubcampStats(subcampId);
    console.log('✅ Subcamp stats updated');

    const response = {
      success: true,
      message: 'Đánh giá đã được nộp thành công',
      submittedCount: result.modifiedCount + result.upsertedCount,
      submittedAt: new Date().toISOString()
    };

    console.log('📤 Sending success response:', response);
    res.json(response);

  } catch (error) {
    console.error('❌ Error submitting evaluation:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Không thể nộp đánh giá',
      error: error.message
    });
  }
};

// Lấy bảng xếp hạng theo camp
const getLeaderboard = async (req, res) => {
  try {
    const { campId } = req.params;

    const leaderboardData = await Evaluation.getLeaderboardData(campId);

    // Thêm thông tin leaders cho mỗi subcamp
    const enrichedData = await Promise.all(
      leaderboardData.map(async (subcamp) => {
        const leaders = await Leader.find({ 
          subcampId: subcamp._id 
        }).select('name evaluationProgress');

        const totalLeaders = leaders.length;
        const completedLeaders = leaders.filter(
          leader => leader.evaluationProgress.status === 'completed'
        ).length;

        return {
          ...subcamp,
          totalLeaders,
          completedLeaders,
          leaders: leaders.map(leader => ({
            name: leader.name,
            status: leader.evaluationProgress.status,
            percentage: leader.evaluationProgress.percentage
          }))
        };
      })
    );

    res.json({
      success: true,
      data: enrichedData,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải bảng xếp hạng',
      error: error.message
    });
  }
};

// Lấy tiến độ của một subcamp cụ thể
const getProgress = async (req, res) => {
  try {
    const { subcampId } = req.params;

    const progress = await Evaluation.getSubcampProgress(subcampId);
    const subcampInfo = await Subcamp.findById(subcampId);

    if (!subcampInfo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy subcamp'
      });
    }

    const result = {
      subcamp: subcampInfo,
      progress: progress[0] || {
        totalEvaluations: 0,
        completedEvaluations: 0,
        percentage: 0,
        averageRating: 0
      }
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải tiến độ',
      error: error.message
    });
  }
};

// Helper function: Update subcamp statistics
const updateSubcampStats = async (subcampId) => {
  try {
    const progress = await Evaluation.getSubcampProgress(subcampId);
    const stats = progress[0];

    if (stats) {
      await Subcamp.findByIdAndUpdate(subcampId, {
        'evaluationStats.totalEvaluations': stats.totalEvaluations,
        'evaluationStats.completedEvaluations': stats.completedEvaluations,
        'evaluationStats.completionPercentage': stats.percentage
      });
    }
  } catch (error) {
    console.error('Error updating subcamp stats:', error);
  }
};

// Lấy tổng quan metrics
const getMetrics = async (req, res) => {
  try {
    const { campId } = req.params;

    // Aggregate data từ tất cả subcamps trong camp
    const subcamps = await Subcamp.find({ campId });
    const subcampIds = subcamps.map(s => s._id);

    const totalEvaluations = await Evaluation.countDocuments({
      subcampId: { $in: subcampIds }
    });

    const completedEvaluations = await Evaluation.countDocuments({
      subcampId: { $in: subcampIds },
      isCompleted: true
    });

    const totalLeaders = await Leader.countDocuments({
      subcampId: { $in: subcampIds }
    });

    const completedLeaders = await Leader.countDocuments({
      subcampId: { $in: subcampIds },
      'evaluationProgress.status': 'completed'
    });

    const totalKids = await Kid.countDocuments({
      subcampId: { $in: subcampIds },
      isActive: true
    });

    const completedKids = await Kid.countDocuments({
      subcampId: { $in: subcampIds },
      'evaluationStatus.isCompleted': true,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        evaluations: {
          total: totalEvaluations,
          completed: completedEvaluations,
          percentage: totalEvaluations > 0 ? Math.round((completedEvaluations / totalEvaluations) * 100) : 0
        },
        leaders: {
          total: totalLeaders,
          completed: completedLeaders,
          percentage: totalLeaders > 0 ? Math.round((completedLeaders / totalLeaders) * 100) : 0
        },
        kids: {
          total: totalKids,
          completed: completedKids,
          percentage: totalKids > 0 ? Math.round((completedKids / totalKids) * 100) : 0
        },
        subcamps: {
          total: subcamps.length,
          completed: subcamps.filter(s => s.evaluationStats.completionPercentage === 100).length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải metrics',
      error: error.message
    });
  }
};

module.exports = {
  getEvaluationsByLeader,
  autoSaveEvaluation,
  submitEvaluation,
  getLeaderboard,
  getProgress,
  getMetrics
};
