const express = require('express');
const router = express.Router();
const {
  createSubscription,
  getCustomerSubscriptions,
  getSellerSubscriptions,
  pauseSubscription,
  getSubscriptionById,
  cancelSubscription
} = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/auth');

// Customer routes
router.post('/', protect, authorize('customer'), createSubscription);
router.get('/customer', protect, authorize('customer'), getCustomerSubscriptions);
router.post('/:id/pause', protect, authorize('customer'), pauseSubscription);
router.put('/:id/cancel', protect, authorize('customer'), cancelSubscription);

// Seller routes
router.get('/seller', protect, authorize('seller'), getSellerSubscriptions);

// Common routes
router.get('/:id', protect, getSubscriptionById);

module.exports = router;