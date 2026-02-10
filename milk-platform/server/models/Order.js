const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
  milk: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milk',
    required: true
  },
  orderType: {
    type: String,
    enum: ['daily', 'subscription'],
    required: true
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    min: 0.5
  },
  pricePerLiter: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
    default: 'pending'
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  notes: {
    type: String,
    trim: true
  },
  cancelledAt: {
    type: Date
  },
  cancelReason: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
orderSchema.index({ customer: 1, deliveryDate: 1 });
orderSchema.index({ seller: 1, deliveryDate: 1, status: 1 });
orderSchema.index({ subscription: 1 });

// Method to validate order time
orderSchema.statics.validateOrderTime = function(deliveryDate) {
  const now = new Date();
  const delivery = new Date(deliveryDate);
  
  // Set hours to compare dates only
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deliveryDay = new Date(delivery.getFullYear(), delivery.getMonth(), delivery.getDate());
  
  // Same day order
  if (deliveryDay.getTime() === today.getTime()) {
    const currentHour = now.getHours();
    
    // Check if between 5:00 AM (5) and 10:00 AM (10)
    if (currentHour < 5 || currentHour >= 10) {
      return {
        valid: false,
        message: 'Same-day orders are only allowed between 5:00 AM and 10:00 AM'
      };
    }
  } else if (deliveryDay < today) {
    // Past date
    return {
      valid: false,
      message: 'Cannot place orders for past dates'
    };
  }
  
  return { valid: true };
};

module.exports = mongoose.model('Order', orderSchema);