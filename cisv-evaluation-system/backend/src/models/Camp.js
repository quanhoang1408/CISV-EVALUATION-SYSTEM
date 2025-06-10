const mongoose = require('mongoose');

const campSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên trại là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tên trại không được quá 200 ký tự']
  },

  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Mô tả không được quá 1000 ký tự']
  },

  startDate: {
    type: Date,
    required: [true, 'Ngày bắt đầu là bắt buộc']
  },

  endDate: {
    type: Date,
    required: [true, 'Ngày kết thúc là bắt buộc'],
    validate: {
      validator: function(v) {
        return v > this.startDate;
      },
      message: 'Ngày kết thúc phải sau ngày bắt đầu'
    }
  },

  location: {
    country: String,
    city: String,
    venue: String,
    address: String
  },

  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'cancelled'],
    default: 'planning'
  },

  totalParticipants: {
    type: Number,
    default: 0
  },

  settings: {
    maxSubcamps: {
      type: Number,
      default: 10
    },
    maxKidsPerLeader: {
      type: Number,
      default: 5
    },
    minKidsPerLeader: {
      type: Number,
      default: 3
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
campSchema.index({ startDate: -1 });
campSchema.index({ status: 1 });

// Virtual để tính duration
campSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

module.exports = mongoose.model('Camp', campSchema);
