const express = require('express');
const router = express.Router();
const {
  createPayment,
  getCustomerPayments,
  getSellerPayments,
  getSubscriptionPayments,
  getSellerEarningsSummary
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Customer routes
router.post('/', protect, authorize('customer'), createPayment);
router.get('/customer', protect, authorize('customer'), getCustomerPayments);

// Seller routes
router.get('/seller', protect, authorize('seller'), getSellerPayments);
router.get('/seller/summary', protect, authorize('seller'), getSellerEarningsSummary);

// Common routes
router.get('/subscription/:subscriptionId', protect, getSubscriptionPayments);

module.exports = router;