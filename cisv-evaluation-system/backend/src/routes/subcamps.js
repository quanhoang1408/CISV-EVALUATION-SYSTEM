const express = require('express');
const router = express.Router();
const { getAllSubcamps, getSubcampsByCamp, createSubcamp } = require('../controllers/subcampController');

router.get('/', getAllSubcamps);
router.get('/camp/:campId', getSubcampsByCamp);
router.post('/', createSubcamp);

module.exports = router;
