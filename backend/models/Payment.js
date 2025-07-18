const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  razorpaySignature: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['created', 'attempted', 'paid', 'failed', 'cancelled', 'refunded'],
    default: 'created'
  },
  plan: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  receipt: {
    type: String,
    required: true
  },
  notes: {
    type: Map,
    of: String,
    default: {}
  },
  failureReason: {
    type: String,
    default: null
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  paidAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ user: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ plan: 1 });

// Methods
paymentSchema.methods.markAsPaid = function(paymentId, signature) {
  this.razorpayPaymentId = paymentId;
  this.razorpaySignature = signature;
  this.status = 'paid';
  this.paidAt = new Date();
  return this.save();
};

paymentSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  return this.save();
};

module.exports = mongoose.model('Payment', paymentSchema);