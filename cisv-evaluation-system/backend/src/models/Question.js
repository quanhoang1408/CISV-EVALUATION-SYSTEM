const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Nội dung câu hỏi là bắt buộc'],
    trim: true,
    maxlength: [500, 'Câu hỏi không được quá 500 ký tự']
  },

  category: {
    type: String,
    required: [true, 'Danh mục là bắt buộc'],
    enum: ['participation', 'teamwork', 'leadership', 'communication', 'behavior', 'creativity', 'problem-solving', 'social-skills'],
    default: 'behavior'
  },

  type: {
    type: String,
    enum: ['rating', 'comment', 'both'],
    default: 'both'
  },

  scale: {
    min: { type: Number, default: 1 },
    max: { type: Number, default: 5 }
  },

  order: {
    type: Number,
    default: 0
  },

  isRequired: {
    type: Boolean,
    default: true
  },

  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Mô tả không được quá 1000 ký tự']
  },

  tips: [String],

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
questionSchema.index({ category: 1, order: 1 });
questionSchema.index({ isActive: 1 });

// Static methods
questionSchema.statics.findActiveByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ order: 1 });
};

questionSchema.statics.findAllActive = function() {
  return this.find({ isActive: true }).sort({ order: 1 });
};

module.exports = mongoose.model('Question', questionSchema);
