const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');

// @desc    Create payment
// @route   POST /api/payments
// @access  Private (Customer)
exports.createPayment = async (req, res) => {
  try {
    const {
      seller,
      orderId,
      subscriptionId,
      amount,
      paymentMethod,
      transactionId,
      notes
    } = req.body;
    
    // Validate that either order or subscription is provided
    if (!orderId && !subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either order ID or subscription ID'
      });
    }
    
    // Verify order/subscription belongs to customer
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      if (order.customer.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }
    }
    
    if (subscriptionId) {
      const subscription = await Subscription.findById(subscriptionId);
      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }
      if (subscription.customer.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }
    }
    
    const payment = await Payment.create({
      customer: req.user._id,
      seller,
      order: orderId || undefined,
      subscription: subscriptionId || undefined,
      amount,
      paymentMethod,
      transactionId,
      notes,
      paymentStatus: 'completed'
    });
    
    const populatedPayment = await Payment.findById(payment._id)
      .populate('customer', 'name phone')
      .populate('seller', 'name businessName')
      .populate('order')
      .populate('subscription');
    
    // Emit socket event to seller
    const io = req.app.get('io');
    io.to(`seller_${seller}`).emit('PAYMENT_RECEIVED', populatedPayment);
    
    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: populatedPayment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating payment',
      error: error.message
    });
  }
};

// @desc    Get customer payments
// @route   GET /api/payments/customer
// @access  Private (Customer)
exports.getCustomerPayments = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { customer: req.user._id };
    
    if (startDate || endDate) {
      query.paidAt = {};
      if (startDate) {
        query.paidAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.paidAt.$lte = new Date(endDate);
      }
    }
    
    const payments = await Payment.find(query)
      .populate('seller', 'name businessName')
      .populate('order', 'deliveryDate quantity')
      .populate('subscription', 'startDate endDate')
      .sort('-paidAt');
    
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

// @desc    Get seller payments
// @route   GET /api/payments/seller
// @access  Private (Seller)
exports.getSellerPayments = async (req, res) => {
  try {
    const { startDate, endDate, customerId } = req.query;
    
    let query = { seller: req.user._id };
    
    if (customerId) {
      query.customer = customerId;
    }
    
    if (startDate || endDate) {
      query.paidAt = {};
      if (startDate) {
        query.paidAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.paidAt.$lte = new Date(endDate);
      }
    }
    
    const payments = await Payment.find(query)
      .populate('customer', 'name phone address')
      .populate('order', 'deliveryDate quantity')
      .populate('subscription', 'startDate endDate')
      .sort('-paidAt');
    
    // Calculate total earnings
    const totalEarnings = await Payment.getSellerEarnings(req.user._id);
    
    res.status(200).json({
      success: true,
      count: payments.length,
      totalEarnings,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

// @desc    Get payment details for subscription
// @route   GET /api/payments/subscription/:subscriptionId
// @access  Private
exports.getSubscriptionPayments = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.subscriptionId);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Check authorization
    const isCustomer = subscription.customer.toString() === req.user._id.toString();
    const isSeller = subscription.seller.toString() === req.user._id.toString();
    
    if (!isCustomer && !isSeller && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    const payments = await Payment.find({ subscription: req.params.subscriptionId })
      .populate('customer', 'name phone')
      .sort('-paidAt');
    
    const totalPaid = await Payment.getTotalPaid(req.params.subscriptionId);
    const remainingAmount = subscription.totalAmount - totalPaid;
    
    res.status(200).json({
      success: true,
      data: {
        payments,
        summary: {
          totalAmount: subscription.totalAmount,
          totalPaid,
          remainingAmount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

// @desc    Get seller earnings summary
// @route   GET /api/payments/seller/summary
// @access  Private (Seller)
exports.getSellerEarningsSummary = async (req, res) => {
  try {
    const totalEarnings = await Payment.getSellerEarnings(req.user._id);
    
    // Get payments by month
    const monthlyEarnings = await Payment.aggregate([
      {
        $match: {
          seller: req.user._id,
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paidAt' },
            month: { $month: '$paidAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      {
        $limit: 12
      }
    ]);
    
    // Get pending payments (subscriptions with remaining balance)
    const activeSubscriptions = await Subscription.find({
      seller: req.user._id,
      status: 'active'
    });
    
    let pendingAmount = 0;
    for (const sub of activeSubscriptions) {
      const paid = await Payment.getTotalPaid(sub._id);
      pendingAmount += (sub.totalAmount - paid);
    }
    
    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        pendingAmount,
        monthlyEarnings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching earnings summary',
      error: error.message
    });
  }
};