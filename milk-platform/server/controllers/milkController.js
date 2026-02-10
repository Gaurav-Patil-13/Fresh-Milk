const Milk = require('../models/Milk');
const User = require('../models/User');

// @desc    Get all milk types (for customers to browse)
// @route   GET /api/milk/types
// @access  Public
exports.getAllMilkTypes = async (req, res) => {
  try {
    const milkTypes = await Milk.aggregate([
      {
        $match: { isAvailable: true }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$milkType', 'Other'] },
              '$customMilkType',
              '$milkType'
            ]
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          milkType: '$_id',
          sellerCount: '$count'
        }
      },
      {
        $sort: { milkType: 1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      count: milkTypes.length,
      data: milkTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching milk types',
      error: error.message
    });
  }
};

// @desc    Get sellers by milk type
// @route   GET /api/milk/sellers/:milkType
// @access  Public
exports.getSellersByMilkType = async (req, res) => {
  try {
    const { milkType } = req.params;
    
    const milkProducts = await Milk.find({
      $or: [
        { milkType: milkType, isAvailable: true },
        { customMilkType: milkType, isAvailable: true }
      ]
    })
    .populate('seller', 'name businessName phone averageRating totalRatings')
    .sort('-averageRating');
    
    res.status(200).json({
      success: true,
      count: milkProducts.length,
      data: milkProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sellers',
      error: error.message
    });
  }
};

// @desc    Get milk by ID
// @route   GET /api/milk/:id
// @access  Public
exports.getMilkById = async (req, res) => {
  try {
    const milk = await Milk.findById(req.params.id)
      .populate('seller', 'name businessName phone address averageRating totalRatings');
    
    if (!milk) {
      return res.status(404).json({
        success: false,
        message: 'Milk product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: milk
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching milk details',
      error: error.message
    });
  }
};

// @desc    Add new milk (Seller only)
// @route   POST /api/milk
// @access  Private (Seller)
exports.addMilk = async (req, res) => {
  try {
    const {
      milkType,
      customMilkType,
      pricePerLiter,
      fatPercentage,
      qualityDescription,
      nutrients,
      availabilityDays
    } = req.body;
    
    // Validate custom milk type if "Other" is selected
    if (milkType === 'Other' && !customMilkType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide custom milk type name'
      });
    }
    
    const milk = await Milk.create({
      seller: req.user._id,
      milkType,
      customMilkType: milkType === 'Other' ? customMilkType : undefined,
      pricePerLiter,
      fatPercentage,
      qualityDescription,
      nutrients,
      availabilityDays
    });
    
    const populatedMilk = await Milk.findById(milk._id)
      .populate('seller', 'name businessName');
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    io.emit('NEW_MILK_ADDED', populatedMilk);
    
    res.status(201).json({
      success: true,
      message: 'Milk product added successfully',
      data: populatedMilk
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding milk product',
      error: error.message
    });
  }
};

// @desc    Update milk (Seller only - own milk)
// @route   PUT /api/milk/:id
// @access  Private (Seller)
exports.updateMilk = async (req, res) => {
  try {
    let milk = await Milk.findById(req.params.id);
    
    if (!milk) {
      return res.status(404).json({
        success: false,
        message: 'Milk product not found'
      });
    }
    
    // Check ownership
    if (milk.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this milk product'
      });
    }
    
    milk = await Milk.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('seller', 'name businessName');
    
    // Emit socket event
    const io = req.app.get('io');
    io.emit('MILK_UPDATED', milk);
    
    res.status(200).json({
      success: true,
      message: 'Milk product updated successfully',
      data: milk
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating milk product',
      error: error.message
    });
  }
};

// @desc    Delete milk (Seller only - own milk)
// @route   DELETE /api/milk/:id
// @access  Private (Seller)
exports.deleteMilk = async (req, res) => {
  try {
    const milk = await Milk.findById(req.params.id);
    
    if (!milk) {
      return res.status(404).json({
        success: false,
        message: 'Milk product not found'
      });
    }
    
    // Check ownership
    if (milk.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this milk product'
      });
    }
    
    await milk.deleteOne();
    
    // Emit socket event
    const io = req.app.get('io');
    io.emit('MILK_DELETED', { milkId: req.params.id });
    
    res.status(200).json({
      success: true,
      message: 'Milk product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting milk product',
      error: error.message
    });
  }
};

// @desc    Get seller's own milk products
// @route   GET /api/milk/seller/my-products
// @access  Private (Seller)
exports.getMyMilkProducts = async (req, res) => {
  try {
    const milkProducts = await Milk.find({ seller: req.user._id })
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: milkProducts.length,
      data: milkProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching milk products',
      error: error.message
    });
  }
};