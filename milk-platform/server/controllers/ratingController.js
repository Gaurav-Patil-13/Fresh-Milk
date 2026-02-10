const Rating = require('../models/Rating');
const Order = require('../models/Order');

// @desc    Create rating
// @route   POST /api/ratings
// @access  Private (Customer)
exports.createRating = async (req, res) => {
  try {
    const {
      seller,
      milk,
      order,
      ratingType,
      milkRating,
      sellerRating,
      milkReview,
      sellerReview
    } = req.body;
    
    // Validate rating type and required fields
    if (ratingType === 'milk' && !milkRating) {
      return res.status(400).json({
        success: false,
        message: 'Milk rating is required for milk rating type'
      });
    }
    
    if (ratingType === 'seller' && !sellerRating) {
      return res.status(400).json({
        success: false,
        message: 'Seller rating is required for seller rating type'
      });
    }
    
    if (ratingType === 'both' && (!milkRating || !sellerRating)) {
      return res.status(400).json({
        success: false,
        message: 'Both milk and seller ratings are required'
      });
    }
    
    // If order is provided, verify it belongs to customer
    if (order) {
      const orderDoc = await Order.findById(order);
      if (!orderDoc) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      if (orderDoc.customer.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to rate this order'
        });
      }
      
      // Check if order is delivered
      if (orderDoc.status !== 'delivered') {
        return res.status(400).json({
          success: false,
          message: 'Can only rate delivered orders'
        });
      }
      
      // Check if already rated
      const existingRating = await Rating.findOne({
        customer: req.user._id,
        order: order
      });
      
      if (existingRating) {
        return res.status(400).json({
          success: false,
          message: 'You have already rated this order'
        });
      }
    }
    
    const rating = await Rating.create({
      customer: req.user._id,
      seller,
      milk: milk || undefined,
      order: order || undefined,
      ratingType,
      milkRating: milkRating || undefined,
      sellerRating: sellerRating || undefined,
      milkReview: milkReview || undefined,
      sellerReview: sellerReview || undefined
    });
    
    const populatedRating = await Rating.findById(rating._id)
      .populate('customer', 'name')
      .populate('seller', 'name businessName')
      .populate('milk', 'milkType customMilkType');
    
    // Emit socket event to seller
    const io = req.app.get('io');
    io.to(`seller_${seller}`).emit('NEW_RATING', populatedRating);
    
    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: populatedRating
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating rating',
      error: error.message
    });
  }
};

// @desc    Get ratings for a seller
// @route   GET /api/ratings/seller/:sellerId
// @access  Public
exports.getSellerRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({
      seller: req.params.sellerId,
      sellerRating: { $exists: true }
    })
      .populate('customer', 'name')
      .populate('milk', 'milkType customMilkType')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: ratings.length,
      data: ratings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ratings',
      error: error.message
    });
  }
};

// @desc    Get ratings for a milk product
// @route   GET /api/ratings/milk/:milkId
// @access  Public
exports.getMilkRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({
      milk: req.params.milkId,
      milkRating: { $exists: true }
    })
      .populate('customer', 'name')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: ratings.length,
      data: ratings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ratings',
      error: error.message
    });
  }
};

// @desc    Get customer's own ratings
// @route   GET /api/ratings/customer
// @access  Private (Customer)
exports.getCustomerRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ customer: req.user._id })
      .populate('seller', 'name businessName')
      .populate('milk', 'milkType customMilkType')
      .populate('order', 'deliveryDate')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: ratings.length,
      data: ratings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ratings',
      error: error.message
    });
  }
};

// @desc    Get seller's received ratings
// @route   GET /api/ratings/seller/received
// @access  Private (Seller)
exports.getSellerReceivedRatings = async (req, res) => {
  try {
    const { ratingType } = req.query;
    
    let query = { seller: req.user._id };
    
    if (ratingType === 'seller') {
      query.sellerRating = { $exists: true };
    } else if (ratingType === 'milk') {
      query.milkRating = { $exists: true };
    }
    
    const ratings = await Rating.find(query)
      .populate('customer', 'name')
      .populate('milk', 'milkType customMilkType')
      .populate('order', 'deliveryDate')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: ratings.length,
      data: ratings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ratings',
      error: error.message
    });
  }
};

// @desc    Update rating
// @route   PUT /api/ratings/:id
// @access  Private (Customer - own ratings only)
exports.updateRating = async (req, res) => {
  try {
    let rating = await Rating.findById(req.params.id);
    
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }
    
    // Check ownership
    if (rating.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this rating'
      });
    }
    
    const {
      milkRating,
      sellerRating,
      milkReview,
      sellerReview
    } = req.body;
    
    // Update fields
    if (milkRating !== undefined) rating.milkRating = milkRating;
    if (sellerRating !== undefined) rating.sellerRating = sellerRating;
    if (milkReview !== undefined) rating.milkReview = milkReview;
    if (sellerReview !== undefined) rating.sellerReview = sellerReview;
    
    await rating.save();
    
    const populatedRating = await Rating.findById(rating._id)
      .populate('customer', 'name')
      .populate('seller', 'name businessName')
      .populate('milk', 'milkType customMilkType');
    
    // Emit socket event to seller
    const io = req.app.get('io');
    io.to(`seller_${rating.seller}`).emit('RATING_UPDATED', populatedRating);
    
    res.status(200).json({
      success: true,
      message: 'Rating updated successfully',
      data: populatedRating
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating rating',
      error: error.message
    });
  }
};

// @desc    Delete rating
// @route   DELETE /api/ratings/:id
// @access  Private (Customer - own ratings only)
exports.deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }
    
    // Check ownership
    if (rating.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this rating'
      });
    }
    
    const sellerId = rating.seller;
    const milkId = rating.milk;
    
    await rating.deleteOne();
    
    // Update average ratings
    if (rating.sellerRating) {
      await Rating.updateSellerRating(sellerId);
    }
    if (rating.milkRating && milkId) {
      await Rating.updateMilkRating(milkId);
    }
    
    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting rating',
      error: error.message
    });
  }
};