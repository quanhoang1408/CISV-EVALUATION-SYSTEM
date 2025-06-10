const Question = require('../models/Question');

const getAllQuestions = async (req, res) => {
  try {
    const { category } = req.query;

    let questions;
    if (category) {
      questions = await Question.findActiveByCategory(category);
    } else {
      questions = await Question.findAllActive();
    }

    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể tải questions', error: error.message });
  }
};

const createQuestion = async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json({ success: true, message: 'Tạo question thành công', data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể tạo question', error: error.message });
  }
};

module.exports = { getAllQuestions, createQuestion };
