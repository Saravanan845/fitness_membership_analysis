const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      required: [true, 'Member ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      default: ''
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [12, 'Age must be at least 12'],
      max: [100, 'Age cannot exceed 100']
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Non-Binary', 'Other', 'Prefer not to say'],
      default: 'Prefer not to say'
    },
    joinDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Expired', 'Pending'],
      default: 'Active'
    },
    monthlySpend: {
      type: Number,
      default: 2000,
      min: 0
    },
    renewed: {
      type: Boolean,
      default: true
    },
    visitsLast30Days: {
      type: Number,
      default: 0,
      min: 0
    },
    classesAttended: {
      type: Number,
      default: 0,
      min: 0
    },
    daysSinceLastVisit: {
      type: Number,
      default: 0,
      min: 0
    },
    engagementLevel: {
      type: String,
      enum: ['High', 'Moderate', 'Low'],
      default: 'Moderate'
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High'],
      default: 'Low'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual relationship to Memberships
memberSchema.virtual('memberships', {
  ref: 'Membership',
  localField: '_id',
  foreignField: 'memberId'
});

// Virtual relationship to Attendance records
memberSchema.virtual('attendances', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'memberId'
});

// Pre-save hook to automatically compute engagement and risk levels
memberSchema.pre('save', function (next) {
  // Engagement Level calculation
  if (this.visitsLast30Days >= 12) {
    this.engagementLevel = 'High';
  } else if (this.visitsLast30Days >= 5) {
    this.engagementLevel = 'Moderate';
  } else {
    this.engagementLevel = 'Low';
  }

  // Risk Level calculation
  if (this.daysSinceLastVisit > 20 || (this.visitsLast30Days <= 3 && !this.renewed)) {
    this.riskLevel = 'High';
  } else if (
    (this.daysSinceLastVisit > 10 && this.daysSinceLastVisit <= 20) ||
    (this.visitsLast30Days >= 4 && this.visitsLast30Days <= 7 && !this.renewed)
  ) {
    this.riskLevel = 'Moderate';
  } else {
    this.riskLevel = 'Low';
  }

  next();
});

module.exports = mongoose.model('Member', memberSchema);
