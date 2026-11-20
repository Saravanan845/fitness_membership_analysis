const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member reference is required'],
      index: true
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    checkInTime: {
      type: Date,
      default: Date.now
    },
    checkOutTime: {
      type: Date
    },
    activityType: {
      type: String,
      enum: ['Open Gym', 'HIIT Class', 'Yoga & Pilates', 'Spinning', 'Strength Training', 'Zumba', 'CrossFit', 'Personal Training'],
      default: 'Open Gym'
    },
    durationMinutes: {
      type: Number,
      default: 60,
      min: 15,
      max: 300
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
