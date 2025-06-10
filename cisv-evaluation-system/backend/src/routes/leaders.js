const express = require('express');
const router = express.Router();
const { getAllLeaders, getLeadersBySubcamp, getLeaderWithKids } = require('../controllers/leaderController');

router.get('/', getAllLeaders);
router.get('/subcamp/:subcampId', getLeadersBySubcamp);
router.get('/:leaderId/kids', getLeaderWithKids);

module.exports = router;
