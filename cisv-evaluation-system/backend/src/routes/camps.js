const express = require('express');
const router = express.Router();
const { getAllCamps, getCampById, createCamp } = require('../controllers/campController');

router.get('/', getAllCamps);
router.get('/:id', getCampById);
router.post('/', createCamp);

module.exports = router;
