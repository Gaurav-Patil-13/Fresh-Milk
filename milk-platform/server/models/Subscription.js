const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
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
  startDate: {
    type: Date,
    required: true
  },
  originalDays: {
    type: Number,
    required: [true, 'Please provide number of days'],
    min: 1
  },
  extendedDays: {
    type: Number,
    default: 0
  },
  totalDays: {
    type: Number,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  quantityPerDay: {
    type: Number,
    required: [true, 'Please provide quantity per day'],
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
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active'
  },
  pausedDates: [{
    date: {
      type: Date,
      required: true
    },
    pausedAt: {
      type: Date,
      default: Date.now
    }
  }],
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
subscriptionSchema.index({ customer: 1, status: 1 });
subscriptionSchema.index({ seller: 1, status: 1 });
subscriptionSchema.index({ startDate: 1, endDate: 1 });

// Virtual field for remaining days
subscriptionSchema.virtual('remainingDays').get(function() {
  const now = new Date();
  const end = new Date(this.endDate);
  
  if (end < now) return 0;
  
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Virtual field for completed days
subscriptionSchema.virtual('completedDays').get(function() {
  const now = new Date();
  const start = new Date(this.startDate);
  
  if (start > now) return 0;
  
  const diffTime = now - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.min(diffDays, this.totalDays);
});

// Method to pause subscription for a specific date
subscriptionSchema.methods.pauseDate = async function(pauseDate) {
  const pause = new Date(pauseDate);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  // Validation: Must be at least 1 day before
  if (pause < tomorrow) {
    throw new Error('Pause must be requested at least 1 day in advance');
  }
  
  // Validation: Must be within subscription period
  if (pause < this.startDate || pause > this.endDate) {
    throw new Error('Date is outside subscription period');
  }
  
  // Check if already paused
  const alreadyPaused = this.pausedDates.some(p => {
    const pDate = new Date(p.date);
    return pDate.toDateString() === pause.toDateString();
  });
  
  if (alreadyPaused) {
    throw new Error('This date is already paused');
  }
  
  // Add paused date
  this.pausedDates.push({ date: pause });
  
  // Extend end date by 1 day
  const newEndDate = new Date(this.endDate);
  newEndDate.setDate(newEndDate.getDate() + 1);
  this.endDate = newEndDate;
  this.extendedDays += 1;
  this.totalDays += 1;
  
  await this.save();
  
  return this;
};

// Method to check if a date is paused
subscriptionSchema.methods.isDatePaused = function(checkDate) {
  const check = new Date(checkDate);
  return this.pausedDates.some(p => {
    const pDate = new Date(p.date);
    return pDate.toDateString() === check.toDateString();
  });
};

// Calculate total and remaining amount
subscriptionSchema.virtual('remainingAmount').get(function() {
  const Payment = mongoose.model('Payment');
  // This will be calculated in the controller
  return 0;
});

module.exports = mongoose.model('Subscription', subscriptionSchema);