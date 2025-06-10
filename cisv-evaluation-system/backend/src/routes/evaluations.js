const express = require('express');
const router = express.Router();
const {
  getEvaluationsByLeader,
  autoSaveEvaluation,
  submitEvaluation,
  getLeaderboard,
  getProgress,
  getMetrics
} = require('../controllers/evaluationController');

// @route   GET /api/evaluations/leader/:leaderId
// @desc    Lấy tất cả đánh giá của leader
router.get('/leader/:leaderId', getEvaluationsByLeader);

// @route   POST /api/evaluations/auto-save
// @desc    Auto-save đánh giá (mỗi 30 giây)
router.post('/auto-save', autoSaveEvaluation);

// @route   POST /api/evaluations/submit
// @desc    Submit đánh giá cuối cùng
router.post('/submit', submitEvaluation);

// @route   GET /api/evaluations/leaderboard/:campId
// @desc    Lấy bảng xếp hạng theo camp
router.get('/leaderboard/:campId', getLeaderboard);

// @route   GET /api/evaluations/progress/:subcampId
// @desc    Lấy tiến độ của subcamp
router.get('/progress/:subcampId', getProgress);

// @route   GET /api/evaluations/metrics/:campId
// @desc    Lấy tổng quan metrics
router.get('/metrics/:campId', getMetrics);

module.exports = router;
