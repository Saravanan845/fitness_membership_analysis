const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member reference is required'],
      index: true
    },
    planName: {
      type: String,
      required: [true, 'Plan name is required'],
      enum: ['Basic Pass', 'Standard Fit', 'Pro Performance', 'Elite VIP'],
      default: 'Standard Fit'
    },
    billingCycle: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Annual'],
      default: 'Monthly'
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: [true, 'Expiry date is required']
    },
    status: {
      type: String,
      enum: ['Active', 'Expiring Soon', 'Expired', 'Cancelled'],
      default: 'Active'
    },
    autoRenew: {
      type: Boolean,
      default: false
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Failed'],
      default: 'Paid'
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to check if membership is expiring soon or expired
membershipSchema.pre('save', function (next) {
  const now = new Date();
  const diffDays = Math.ceil((this.endDate - now) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    this.status = 'Expired';
  } else if (diffDays <= 7 && this.status !== 'Cancelled') {
    this.status = 'Expiring Soon';
  } else if (this.status !== 'Cancelled') {
    this.status = 'Active';
  }

  next();
});

module.exports = mongoose.model('Membership', membershipSchema);
