const mongoose = require('mongoose');

const leaderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên leader là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên không được quá 100 ký tự']
  },

  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Email không hợp lệ'
    }
  },

  subcampId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcamp',
    required: [true, 'Subcamp ID là bắt buộc']
  },

  phone: String,

  nationality: String,

  experience: {
    years: Number,
    previousCamps: [String],
    specializations: [String]
  },

  kidsCount: {
    type: Number,
    default: 0,
    min: [0, 'Số lượng kids không thể âm'],
    max: [5, 'Một leader chỉ có thể quản lý tối đa 5 kids']
  },

  evaluationProgress: {
    totalKids: { type: Number, default: 0 },
    completedKids: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    completedQuestions: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started'
    },
    lastUpdated: Date,
    submittedAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
leaderSchema.index({ subcampId: 1 });
leaderSchema.index({ email: 1 }, { unique: true });
leaderSchema.index({ 'evaluationProgress.status': 1 });

// Virtual cho full evaluation status
leaderSchema.virtual('evaluationStatus').get(function() {
  return this.evaluationProgress.status;
});

// Static method để lấy leaders có kids
leaderSchema.statics.findWithKids = function(leaderId) {
  return this.findById(leaderId).populate({
    path: 'kids',
    model: 'Kid',
    match: { isActive: true },
    select: 'name age nationality profileImage'
  });
};

module.exports = mongoose.model('Leader', leaderSchema);
