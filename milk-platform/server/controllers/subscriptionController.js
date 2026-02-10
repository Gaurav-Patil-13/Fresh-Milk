const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const Milk = require('../models/Milk');
const Payment = require('../models/Payment');

// @desc    Create subscription
// @route   POST /api/subscriptions
// @access  Private (Customer)
exports.createSubscription = async (req, res) => {
  try {
    const {
      milkId,
      startDate,
      numberOfDays,
      quantityPerDay,
      deliveryAddress,
      notes
    } = req.body;
    
    // Validate start date
    const start = new Date(startDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (start < now) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }
    
    // Get milk details
    const milk = await Milk.findById(milkId).populate('seller');
    
    if (!milk) {
      return res.status(404).json({
        success: false,
        message: 'Milk product not found'
      });
    }
    
    if (!milk.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This milk product is currently unavailable'
      });
    }
    
    // Calculate end date
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + numberOfDays - 1);
    
    const totalAmount = numberOfDays * quantityPerDay * milk.pricePerLiter;
    
    // Create subscription
    const subscription = await Subscription.create({
      customer: req.user._id,
      seller: milk.seller._id,
      milk: milkId,
      startDate: start,
      originalDays: numberOfDays,
      totalDays: numberOfDays,
      endDate,
      quantityPerDay,
      pricePerLiter: milk.pricePerLiter,
      totalAmount,
      deliveryAddress: deliveryAddress || req.user.address,
      notes,
      status: 'active'
    });
    
    // Create orders for each day
    const orders = [];
    for (let i = 0; i < numberOfDays; i++) {
      const deliveryDate = new Date(start);
      deliveryDate.setDate(deliveryDate.getDate() + i);
      
      const order = await Order.create({
        customer: req.user._id,
        seller: milk.seller._id,
        milk: milkId,
        orderType: 'subscription',
        deliveryDate,
        quantity: quantityPerDay,
        pricePerLiter: milk.pricePerLiter,
        totalAmount: quantityPerDay * milk.pricePerLiter,
        subscription: subscription._id,
        deliveryAddress: deliveryAddress || req.user.address,
        status: 'pending'
      });
      
      orders.push(order);
    }
    
    const populatedSubscription = await Subscription.findById(subscription._id)
      .populate('customer', 'name phone address')
      .populate('seller', 'name businessName phone')
      .populate('milk', 'milkType customMilkType pricePerLiter');
    
    // Emit socket event to seller
    const io = req.app.get('io');
    io.to(`seller_${milk.seller._id}`).emit('NEW_SUBSCRIPTION', populatedSubscription);
    
    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        subscription: populatedSubscription,
        ordersCreated: orders.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating subscription',
      error: error.message
    });
  }
};

// @desc    Get customer subscriptions
// @route   GET /api/subscriptions/customer
// @access  Private (Customer)
exports.getCustomerSubscriptions = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { customer: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    const subscriptions = await Subscription.find(query)
      .populate('seller', 'name businessName phone averageRating')
      .populate('milk', 'milkType customMilkType pricePerLiter fatPercentage')
      .sort('-createdAt');
    
    // Calculate paid amounts for each subscription
    const subscriptionsWithPayments = await Promise.all(
      subscriptions.map(async (sub) => {
        const totalPaid = await Payment.getTotalPaid(sub._id);
        const remainingAmount = sub.totalAmount - totalPaid;
        
        return {
          ...sub.toObject(),
          totalPaid,
          remainingAmount,
          remainingDays: sub.remainingDays,
          completedDays: sub.completedDays
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: subscriptionsWithPayments.length,
      data: subscriptionsWithPayments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscriptions',
      error: error.message
    });
  }
};

// @desc    Get seller subscriptions
// @route   GET /api/subscriptions/seller
// @access  Private (Seller)
exports.getSellerSubscriptions = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { seller: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    const subscriptions = await Subscription.find(query)
      .populate('customer', 'name phone address')
      .populate('milk', 'milkType customMilkType pricePerLiter')
      .sort('-createdAt');
    
    // Calculate paid amounts for each subscription
    const subscriptionsWithPayments = await Promise.all(
      subscriptions.map(async (sub) => {
        const totalPaid = await Payment.getTotalPaid(sub._id);
        const remainingAmount = sub.totalAmount - totalPaid;
        
        return {
          ...sub.toObject(),
          totalPaid,
          remainingAmount,
          remainingDays: sub.remainingDays,
          completedDays: sub.completedDays,
          extendedDays: sub.extendedDays
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: subscriptionsWithPayments.length,
      data: subscriptionsWithPayments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscriptions',
      error: error.message
    });
  }
};

// @desc    Pause subscription for a specific date
// @route   POST /api/subscriptions/:id/pause
// @access  Private (Customer)
exports.pauseSubscription = async (req, res) => {
  try {
    const { pauseDate } = req.body;
    
    if (!pauseDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide pause date'
      });
    }
    
    let subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Check ownership
    if (subscription.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pause this subscription'
      });
    }
    
    if (subscription.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Can only pause active subscriptions'
      });
    }
    
    try {
      // Pause the subscription date
      await subscription.pauseDate(pauseDate);
      
      // Cancel the order for that specific date
      const pause = new Date(pauseDate);
      pause.setHours(0, 0, 0, 0);
      const endOfDay = new Date(pause);
      endOfDay.setHours(23, 59, 59, 999);
      
      const order = await Order.findOne({
        subscription: subscription._id,
        deliveryDate: { $gte: pause, $lte: endOfDay }
      });
      
      if (order && order.status === 'pending') {
        order.status = 'cancelled';
        order.cancelReason = 'Paused by customer';
        order.cancelledAt = new Date();
        await order.save();
      }
      
      const populatedSubscription = await Subscription.findById(subscription._id)
        .populate('customer', 'name phone')
        .populate('seller', 'name businessName')
        .populate('milk', 'milkType customMilkType');
      
      // Emit socket event to seller
      const io = req.app.get('io');
      io.to(`seller_${subscription.seller}`).emit('SUBSCRIPTION_PAUSED', {
        subscription: populatedSubscription,
        pausedDate: pauseDate
      });
      
      res.status(200).json({
        success: true,
        message: 'Subscription paused for the specified date. End date extended by 1 day.',
        data: populatedSubscription
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error pausing subscription',
      error: error.message
    });
  }
};

// @desc    Get subscription by ID
// @route   GET /api/subscriptions/:id
// @access  Private
exports.getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('customer', 'name phone address')
      .populate('seller', 'name businessName phone')
      .populate('milk', 'milkType customMilkType pricePerLiter fatPercentage qualityDescription');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Check authorization
    const isCustomer = subscription.customer._id.toString() === req.user._id.toString();
    const isSeller = subscription.seller._id.toString() === req.user._id.toString();
    
    if (!isCustomer && !isSeller && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this subscription'
      });
    }
    
    // Get payment details
    const totalPaid = await Payment.getTotalPaid(subscription._id);
    const remainingAmount = subscription.totalAmount - totalPaid;
    
    // Get orders for this subscription
    const orders = await Order.find({ subscription: subscription._id })
      .sort('deliveryDate')
      .select('deliveryDate status quantity totalAmount');
    
    res.status(200).json({
      success: true,
      data: {
        ...subscription.toObject(),
        totalPaid,
        remainingAmount,
        remainingDays: subscription.remainingDays,
        completedDays: subscription.completedDays,
        orders
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription',
      error: error.message
    });
  }
};

// @desc    Cancel subscription
// @route   PUT /api/subscriptions/:id/cancel
// @access  Private (Customer)
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Check ownership
    if (subscription.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this subscription'
      });
    }
    
    if (subscription.status === 'cancelled' || subscription.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel subscription with status: ${subscription.status}`
      });
    }
    
    subscription.status = 'cancelled';
    await subscription.save();
    
    // Cancel all pending future orders
    await Order.updateMany(
      {
        subscription: subscription._id,
        status: 'pending',
        deliveryDate: { $gte: new Date() }
      },
      {
        status: 'cancelled',
        cancelReason: 'Subscription cancelled',
        cancelledAt: new Date()
      }
    );
    
    const populatedSubscription = await Subscription.findById(subscription._id)
      .populate('seller', 'name businessName')
      .populate('milk', 'milkType customMilkType');
    
    // Emit socket event to seller
    const io = req.app.get('io');
    io.to(`seller_${subscription.seller}`).emit('SUBSCRIPTION_CANCELLED', populatedSubscription);
    
    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: populatedSubscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription',
      error: error.message
    });
  }
};