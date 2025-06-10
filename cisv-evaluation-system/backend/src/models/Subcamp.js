const mongoose = require('mongoose');

const subcampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên trại nhỏ là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên trại nhỏ không được quá 100 ký tự']
  },

  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Mô tả không được quá 500 ký tự']
  },

  campId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Camp',
    required: [true, 'Camp ID là bắt buộc']
  },

  color: {
    type: String,
    default: '#667eea',
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'Màu phải là mã hex hợp lệ'
    }
  },

  maxLeaders: {
    type: Number,
    default: 10,
    min: [1, 'Số lượng leader tối thiểu là 1']
  },

  currentLeaders: {
    type: Number,
    default: 0
  },

  totalKids: {
    type: Number,
    default: 0
  },

  evaluationStats: {
    totalEvaluations: { type: Number, default: 0 },
    completedEvaluations: { type: Number, default: 0 },
    inProgressEvaluations: { type: Number, default: 0 },
    completionPercentage: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
subcampSchema.index({ campId: 1 });
subcampSchema.index({ 'evaluationStats.completionPercentage': -1 });

// Virtual cho trạng thái
subcampSchema.virtual('isComplete').get(function() {
  return this.evaluationStats.completionPercentage === 100;
});

module.exports = mongoose.model('Subcamp', subcampSchema);
