const express = require('express');
const router = express.Router();
const {
  createDailyOrder,
  getCustomerOrders,
  getSellerOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderById
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// Customer routes
router.post('/daily', protect, authorize('customer'), createDailyOrder);
router.get('/customer', protect, authorize('customer'), getCustomerOrders);
router.put('/:id/cancel', protect, authorize('customer'), cancelOrder);

// Seller routes
router.get('/seller', protect, authorize('seller'), getSellerOrders);
router.put('/:id/status', protect, authorize('seller'), updateOrderStatus);

// Common routes
router.get('/:id', protect, getOrderById);

module.exports = router;