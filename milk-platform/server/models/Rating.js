const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
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
    ref: 'Milk'
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  ratingType: {
    type: String,
    enum: ['milk', 'seller', 'both'],
    required: true
  },
  milkRating: {
    type: Number,
    min: 1,
    max: 5
  },
  sellerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  milkReview: {
    type: String,
    trim: true
  },
  sellerReview: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
ratingSchema.index({ customer: 1, seller: 1, milk: 1 });
ratingSchema.index({ seller: 1 });
ratingSchema.index({ milk: 1 });

// Prevent duplicate ratings for same order
ratingSchema.index({ customer: 1, order: 1 }, { unique: true, sparse: true });

// Method to update seller average rating
ratingSchema.statics.updateSellerRating = async function(sellerId) {
  const User = mongoose.model('User');
  
  const result = await this.aggregate([
    {
      $match: {
        seller: mongoose.Types.ObjectId(sellerId),
        sellerRating: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$sellerRating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);
  
  if (result.length > 0) {
    await User.findByIdAndUpdate(sellerId, {
      averageRating: Math.round(result[0].avgRating * 10) / 10,
      totalRatings: result[0].totalRatings
    });
  }
};

// Method to update milk average rating
ratingSchema.statics.updateMilkRating = async function(milkId) {
  const Milk = mongoose.model('Milk');
  
  const result = await this.aggregate([
    {
      $match: {
        milk: mongoose.Types.ObjectId(milkId),
        milkRating: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$milkRating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);
  
  if (result.length > 0) {
    await Milk.findByIdAndUpdate(milkId, {
      averageRating: Math.round(result[0].avgRating * 10) / 10,
      totalRatings: result[0].totalRatings
    });
  }
};

// Post-save hook to update ratings
ratingSchema.post('save', async function() {
  if (this.sellerRating) {
    await this.constructor.updateSellerRating(this.seller);
  }
  if (this.milkRating && this.milk) {
    await this.constructor.updateMilkRating(this.milk);
  }
});

module.exports = mongoose.model('Rating', ratingSchema);