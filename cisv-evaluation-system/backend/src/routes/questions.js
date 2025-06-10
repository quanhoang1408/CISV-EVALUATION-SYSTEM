const express = require('express');
const router = express.Router();
const { getAllQuestions, createQuestion } = require('../controllers/questionController');

router.get('/', getAllQuestions);
router.post('/', createQuestion);

module.exports = router;
