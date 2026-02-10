const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  amount: {
    type: Number,
    required: [true, 'Please provide payment amount'],
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'netbanking', 'wallet'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  transactionId: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  paidAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ customer: 1, seller: 1 });
paymentSchema.index({ order: 1 });
paymentSchema.index({ subscription: 1 });
paymentSchema.index({ paidAt: 1 });

// Static method to calculate total paid for a subscription
paymentSchema.statics.getTotalPaid = async function(subscriptionId) {
  const result = await this.aggregate([
    {
      $match: {
        subscription: mongoose.Types.ObjectId(subscriptionId),
        paymentStatus: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: '$amount' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].totalPaid : 0;
};

// Static method to calculate total paid for an order
paymentSchema.statics.getTotalPaidForOrder = async function(orderId) {
  const result = await this.aggregate([
    {
      $match: {
        order: mongoose.Types.ObjectId(orderId),
        paymentStatus: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: '$amount' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].totalPaid : 0;
};

// Static method to get seller's total earnings
paymentSchema.statics.getSellerEarnings = async function(sellerId) {
  const result = await this.aggregate([
    {
      $match: {
        seller: mongoose.Types.ObjectId(sellerId),
        paymentStatus: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$amount' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].totalEarnings : 0;
};

module.exports = mongoose.model('Payment', paymentSchema);