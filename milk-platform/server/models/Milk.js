const mongoose = require('mongoose');

const milkSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  milkType: {
    type: String,
    required: [true, 'Please provide milk type'],
    trim: true,
    enum: {
      values: ['Cow', 'Buffalo', 'Goat', 'Camel', 'Sheep', 'Other'],
      message: '{VALUE} is not a valid milk type'
    }
  },
  customMilkType: {
    type: String,
    trim: true
  },
  pricePerLiter: {
    type: Number,
    required: [true, 'Please provide price per liter'],
    min: 0
  },
  fatPercentage: {
    type: Number,
    required: [true, 'Please provide fat percentage'],
    min: 0,
    max: 100
  },
  qualityDescription: {
    type: String,
    required: [true, 'Please provide quality description'],
    trim: true
  },
  nutrients: {
    protein: {
      type: Number,
      default: 0
    },
    calcium: {
      type: Number,
      default: 0
    },
    vitamins: {
      type: String,
      default: ''
    },
    minerals: {
      type: String,
      default: ''
    }
  },
  availabilityDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
milkSchema.index({ seller: 1, milkType: 1 });
milkSchema.index({ milkType: 1, isAvailable: 1 });

// Virtual field to get effective milk type
milkSchema.virtual('effectiveMilkType').get(function() {
  return this.milkType === 'Other' ? this.customMilkType : this.milkType;
});

module.exports = mongoose.model('Milk', milkSchema);