const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  leaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Leader',
    required: [true, 'Leader ID là bắt buộc']
  },

  kidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kid',
    required: [true, 'Kid ID là bắt buộc']
  },

  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: [true, 'Question ID là bắt buộc']
  },

  subcampId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcamp',
    required: [true, 'Subcamp ID là bắt buộc']
  },

  rating: {
    type: Number,
    min: [1, 'Rating tối thiểu là 1'],
    max: [5, 'Rating tối đa là 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating phải là số nguyên'
    }
  },

  comment: {
    type: String,
    trim: true,
    maxlength: [2000, 'Nhận xét không được quá 2000 ký tự']
  },

  isCompleted: {
    type: Boolean,
    default: false
  },

  version: {
    type: Number,
    default: 1
  },

  submittedAt: Date,

  // Metadata cho auto-save
  lastModified: {
    type: Date,
    default: Date.now
  },

  autoSaveData: {
    sessionId: String,
    deviceInfo: String,
    ipAddress: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Unique compound index
evaluationSchema.index({ 
  leaderId: 1, 
  kidId: 1, 
  questionId: 1 
}, { unique: true });

// Other indexes
evaluationSchema.index({ subcampId: 1, isCompleted: 1 });
evaluationSchema.index({ leaderId: 1 });
evaluationSchema.index({ submittedAt: -1 });

// Virtual fields
evaluationSchema.virtual('kid', {
  ref: 'Kid',
  localField: 'kidId',
  foreignField: '_id',
  justOne: true
});

evaluationSchema.virtual('leader', {
  ref: 'Leader',
  localField: 'leaderId',
  foreignField: '_id',
  justOne: true
});

evaluationSchema.virtual('question', {
  ref: 'Question',
  localField: 'questionId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware
evaluationSchema.pre('save', function(next) {
  this.lastModified = new Date();

  // Auto-complete nếu có rating
  if (this.rating && this.rating > 0) {
    this.isCompleted = true;
  }

  next();
});

// Post-save middleware để cập nhật progress
evaluationSchema.post('save', async function(doc, next) {
  try {
    // Cập nhật kid evaluation status
    const Kid = mongoose.model('Kid');
    const totalQuestions = await mongoose.model('Question').countDocuments({ isActive: true });
    const completedQuestions = await mongoose.model('Evaluation').countDocuments({
      kidId: doc.kidId,
      isCompleted: true
    });

    await Kid.findByIdAndUpdate(doc.kidId, {
      'evaluationStatus.totalQuestions': totalQuestions,
      'evaluationStatus.completedQuestions': completedQuestions,
      'evaluationStatus.lastEvaluated': new Date()
    });

    // Cập nhật leader progress
    const Leader = mongoose.model('Leader');
    const leaderKids = await Kid.find({ leaderId: doc.leaderId });
    const totalLeaderQuestions = leaderKids.length * totalQuestions;
    const completedLeaderQuestions = await mongoose.model('Evaluation').countDocuments({
      leaderId: doc.leaderId,
      isCompleted: true
    });

    const percentage = totalLeaderQuestions > 0 ? Math.round((completedLeaderQuestions / totalLeaderQuestions) * 100) : 0;
    let status = 'not-started';
    if (percentage > 0 && percentage < 100) status = 'in-progress';
    if (percentage === 100) status = 'completed';

    await Leader.findByIdAndUpdate(doc.leaderId, {
      'evaluationProgress.totalQuestions': totalLeaderQuestions,
      'evaluationProgress.completedQuestions': completedLeaderQuestions,
      'evaluationProgress.percentage': percentage,
      'evaluationProgress.status': status,
      'evaluationProgress.lastUpdated': new Date()
    });

  } catch (error) {
    console.error('Error updating progress:', error);
  }

  next();
});

// Instance methods
evaluationSchema.methods.markComplete = function() {
  this.isCompleted = true;
  this.submittedAt = new Date();
  return this.save();
};

// Static methods
evaluationSchema.statics.findByLeader = function(leaderId) {
  return this.find({ leaderId })
    .populate('kidId', 'name age')
    .populate('questionId', 'text category')
    .sort({ 'questionId.order': 1 });
};

evaluationSchema.statics.findByKid = function(kidId) {
  return this.find({ kidId })
    .populate('questionId', 'text category order')
    .populate('leaderId', 'name')
    .sort({ 'questionId.order': 1 });
};

evaluationSchema.statics.getLeaderboardData = function(campId) {
  return this.aggregate([
    {
      $lookup: {
        from: 'subcamps',
        localField: 'subcampId',
        foreignField: '_id',
        as: 'subcamp'
      }
    },
    {
      $unwind: '$subcamp'
    },
    {
      $lookup: {
        from: 'camps',
        localField: 'subcamp.campId',
        foreignField: '_id',
        as: 'camp'
      }
    },
    {
      $unwind: '$camp'
    },
    {
      $match: {
        'camp._id': new mongoose.Types.ObjectId(campId)
      }
    },
    {
      $group: {
        _id: '$subcampId',
        subcampName: { $first: '$subcamp.name' },
        subcampDescription: { $first: '$subcamp.description' },
        totalEvaluations: { $sum: 1 },
        completedEvaluations: {
          $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] }
        }
      }
    },
    {
      $addFields: {
        percentage: {
          $round: [{
            $multiply: [
              { $divide: ['$completedEvaluations', '$totalEvaluations'] },
              100
            ]
          }, 0]
        }
      }
    },
    {
      $sort: { percentage: -1, completedEvaluations: -1 }
    }
  ]);
};

evaluationSchema.statics.getSubcampProgress = function(subcampId) {
  return this.aggregate([
    {
      $match: { subcampId: new mongoose.Types.ObjectId(subcampId) }
    },
    {
      $group: {
        _id: null,
        totalEvaluations: { $sum: 1 },
        completedEvaluations: {
          $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] }
        },
        averageRating: {
          $avg: { $cond: [{ $gt: ['$rating', 0] }, '$rating', null] }
        }
      }
    },
    {
      $addFields: {
        percentage: {
          $round: [{
            $multiply: [
              { $divide: ['$completedEvaluations', '$totalEvaluations'] },
              100
            ]
          }, 0]
        }
      }
    }
  ]);
};

// Bulk save method for auto-save functionality
evaluationSchema.statics.bulkSave = async function(evaluations) {
  const operations = evaluations.map(evaluation => ({
    updateOne: {
      filter: {
        leaderId: evaluation.leaderId,
        kidId: evaluation.kidId,
        questionId: evaluation.questionId
      },
      update: {
        $set: {
          ...evaluation,
          lastModified: new Date()
        }
      },
      upsert: true
    }
  }));

  return this.bulkWrite(operations);
};

module.exports = mongoose.model('Evaluation', evaluationSchema);
