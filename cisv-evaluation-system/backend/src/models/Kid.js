const mongoose = require('mongoose');

const kidSchema = new mongoose.Schema({
  // Thông tin cơ bản (bắt buộc)
  name: {
    type: String,
    required: [true, 'Tên trẻ em là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên không được quá 100 ký tự']
  },

  age: {
    type: Number,
    required: [true, 'Tuổi là bắt buộc'],
    min: [6, 'Tuổi tối thiểu là 6'],
    max: [18, 'Tuổi tối đa là 18']
  },

  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Giới tính là bắt buộc']
  },

  nationality: {
    type: String,
    required: [true, 'Quốc tịch là bắt buộc'],
    trim: true
  },

  // Phân công (bắt buộc)
  subcampId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcamp',
    required: [true, 'Trại nhỏ là bắt buộc']
  },

  leaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Leader',
    required: [true, 'Leader phụ trách là bắt buộc']
  },

  // Thông tin cá nhân chi tiết
  profileImage: {
    type: String,
    default: null
  },

  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true; // optional field
        const age = Math.floor((new Date() - v) / (365.25 * 24 * 60 * 60 * 1000));
        return age >= 6 && age <= 18;
      },
      message: 'Ngày sinh không hợp lệ'
    }
  },

  languages: [{
    type: String,
    trim: true
  }],

  interests: [{
    type: String,
    trim: true
  }],

  allergies: [{
    type: String,
    trim: true
  }],

  medicalConditions: [{
    condition: String,
    description: String,
    medication: String
  }],

  // Thông tin liên lạc
  parentGuardian: {
    name: String,
    relationship: String,
    phone: String,
    email: String,
    address: String
  },

  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },

  // Thông tin trại
  campHistory: [{
    year: Number,
    camp: String,
    role: String
  }],

  roomNumber: String,

  dietary: {
    restrictions: [String],
    preferences: [String]
  },

  // Theo dõi đánh giá
  evaluationStatus: {
    isStarted: {
      type: Boolean,
      default: false
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedQuestions: {
      type: Number,
      default: 0
    },
    totalQuestions: {
      type: Number,
      default: 0
    },
    completionPercentage: {
      type: Number,
      default: 0
    },
    lastEvaluated: Date,
    submittedAt: Date
  },

  // Đánh giá hành vi chung
  behaviorAssessment: {
    strengths: [String],
    areasForImprovement: [String],
    overallRating: {
      type: Number,
      min: 1,
      max: 5
    },
    leaderNotes: String
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes cho hiệu suất
kidSchema.index({ leaderId: 1, subcampId: 1 });
kidSchema.index({ name: 1 });
kidSchema.index({ 'evaluationStatus.isCompleted': 1 });
kidSchema.index({ createdAt: -1 });

// Virtual fields
kidSchema.virtual('fullName').get(function() {
  return this.name;
});

kidSchema.virtual('ageGroup').get(function() {
  if (this.age <= 8) return 'Nhóm nhỏ (6-8 tuổi)';
  if (this.age <= 12) return 'Nhóm trung (9-12 tuổi)';
  return 'Nhóm lớn (13-18 tuổi)';
});

kidSchema.virtual('evaluationProgress').get(function() {
  if (this.evaluationStatus.totalQuestions === 0) return 0;
  return Math.round((this.evaluationStatus.completedQuestions / this.evaluationStatus.totalQuestions) * 100);
});

// Pre-save middleware
kidSchema.pre('save', function(next) {
  // Tự động tính tuổi từ ngày sinh nếu có
  if (this.dateOfBirth && !this.age) {
    this.age = Math.floor((new Date() - this.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000));
  }

  // Cập nhật completion percentage
  if (this.evaluationStatus.totalQuestions > 0) {
    this.evaluationStatus.completionPercentage = Math.round(
      (this.evaluationStatus.completedQuestions / this.evaluationStatus.totalQuestions) * 100
    );
  }

  // Cập nhật trạng thái
  if (this.evaluationStatus.completionPercentage === 100) {
    this.evaluationStatus.isCompleted = true;
    if (!this.evaluationStatus.submittedAt) {
      this.evaluationStatus.submittedAt = new Date();
    }
  }

  this.updatedAt = new Date();
  next();
});

// Instance methods
kidSchema.methods.updateEvaluationProgress = function(completedQuestions, totalQuestions) {
  this.evaluationStatus.completedQuestions = completedQuestions;
  this.evaluationStatus.totalQuestions = totalQuestions;
  this.evaluationStatus.lastEvaluated = new Date();

  if (completedQuestions > 0) {
    this.evaluationStatus.isStarted = true;
  }

  return this.save();
};

kidSchema.methods.completeEvaluation = function() {
  this.evaluationStatus.isCompleted = true;
  this.evaluationStatus.submittedAt = new Date();
  return this.save();
};

// Static methods
kidSchema.statics.findByLeader = function(leaderId) {
  return this.find({ leaderId, isActive: true })
    .populate('subcampId', 'name description')
    .sort({ name: 1 });
};

kidSchema.statics.findBySubcamp = function(subcampId) {
  return this.find({ subcampId, isActive: true })
    .populate('leaderId', 'name email')
    .sort({ name: 1 });
};

kidSchema.statics.findByAgeGroup = function(minAge, maxAge) {
  return this.find({ 
    age: { $gte: minAge, $lte: maxAge },
    isActive: true 
  }).sort({ age: 1, name: 1 });
};

kidSchema.statics.getEvaluationStats = function(subcampId) {
  return this.aggregate([
    { $match: { subcampId: mongoose.Types.ObjectId(subcampId), isActive: true } },
    {
      $group: {
        _id: null,
        totalKids: { $sum: 1 },
        completedEvaluations: {
          $sum: { $cond: [{ $eq: ['$evaluationStatus.isCompleted', true] }, 1, 0] }
        },
        inProgressEvaluations: {
          $sum: { $cond: [{ $and: [
            { $eq: ['$evaluationStatus.isStarted', true] },
            { $eq: ['$evaluationStatus.isCompleted', false] }
          ]}, 1, 0] }
        },
        averageProgress: { $avg: '$evaluationStatus.completionPercentage' }
      }
    }
  ]);
};

module.exports = mongoose.model('Kid', kidSchema);
