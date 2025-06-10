const express = require('express');
const router = express.Router();
const {
  getAllKids,
  getKidsByLeader,
  getKidById,
  createKid,
  updateKid,
  deleteKid,
  getKidsStatsBySubcamp
} = require('../controllers/kidController');

router.get('/', getAllKids);
router.get('/leader/:leaderId', getKidsByLeader);
router.get('/stats/subcamp/:subcampId', getKidsStatsBySubcamp);
router.get('/:id', getKidById);
router.post('/', createKid);
router.put('/:id', updateKid);
router.delete('/:id', deleteKid);

module.exports = router;
