const Order = require('../models/Order');
const Milk = require('../models/Milk');
const Subscription = require('../models/Subscription');

// @desc    Create daily order
// @route   POST /api/orders/daily
// @access  Private (Customer)
exports.createDailyOrder = async (req, res) => {
  try {
    const { milkId, deliveryDate, quantity, deliveryAddress, notes } = req.body;
    
    // Validate order time
    const timeValidation = Order.validateOrderTime(deliveryDate);
    if (!timeValidation.valid) {
      return res.status(400).json({
        success: false,
        message: timeValidation.message
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
    
    // Check availability for the delivery date
    const deliveryDay = new Date(deliveryDate).toLocaleDateString('en-US', { weekday: 'long' });
    if (milk.availabilityDays && milk.availabilityDays.length > 0) {
      if (!milk.availabilityDays.includes(deliveryDay)) {
        return res.status(400).json({
          success: false,
          message: `Milk is not available on ${deliveryDay}`
        });
      }
    }
    
    const totalAmount = quantity * milk.pricePerLiter;
    
    const order = await Order.create({
      customer: req.user._id,
      seller: milk.seller._id,
      milk: milkId,
      orderType: 'daily',
      deliveryDate,
      quantity,
      pricePerLiter: milk.pricePerLiter,
      totalAmount,
      deliveryAddress: deliveryAddress || req.user.address,
      notes
    });
    
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name phone address')
      .populate('seller', 'name businessName phone')
      .populate('milk', 'milkType customMilkType pricePerLiter');
    
    // Emit socket event to seller
    const io = req.app.get('io');
    io.to(`seller_${milk.seller._id}`).emit('NEW_ORDER', populatedOrder);
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: populatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// @desc    Get customer orders
// @route   GET /api/orders/customer
// @access  Private (Customer)
exports.getCustomerOrders = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = { customer: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.deliveryDate = {};
      if (startDate) {
        query.deliveryDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.deliveryDate.$lte = new Date(endDate);
      }
    }
    
    const orders = await Order.find(query)
      .populate('seller', 'name businessName phone')
      .populate('milk', 'milkType customMilkType pricePerLiter')
      .populate('subscription', 'startDate endDate status')
      .sort('-deliveryDate');
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Get seller orders
// @route   GET /api/orders/seller
// @access  Private (Seller)
exports.getSellerOrders = async (req, res) => {
  try {
    const { status, date } = req.query;
    
    let query = { seller: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.deliveryDate = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }
    
    const orders = await Order.find(query)
      .populate('customer', 'name phone address')
      .populate('milk', 'milkType customMilkType pricePerLiter')
      .populate('subscription', 'startDate endDate status')
      .sort('deliveryDate');
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Seller)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    let order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if seller owns this order
    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }
    
    order.status = status;
    await order.save();
    
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name phone')
      .populate('milk', 'milkType customMilkType');
    
    // Emit socket event to customer
    const io = req.app.get('io');
    io.to(`customer_${order.customer}`).emit('ORDER_STATUS_UPDATED', populatedOrder);
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: populatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Customer)
exports.cancelOrder = async (req, res) => {
  try {
    const { cancelReason } = req.body;
    
    let order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if customer owns this order
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }
    
    // Check if order can be cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }
    
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = cancelReason;
    await order.save();
    
    const populatedOrder = await Order.findById(order._id)
      .populate('seller', 'name businessName')
      .populate('milk', 'milkType customMilkType');
    
    // Emit socket event to seller
    const io = req.app.get('io');
    io.to(`seller_${order.seller}`).emit('ORDER_CANCELLED', populatedOrder);
    
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: populatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name phone address')
      .populate('seller', 'name businessName phone')
      .populate('milk', 'milkType customMilkType pricePerLiter fatPercentage')
      .populate('subscription');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check authorization
    const isCustomer = order.customer._id.toString() === req.user._id.toString();
    const isSeller = order.seller._id.toString() === req.user._id.toString();
    
    if (!isCustomer && !isSeller && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};