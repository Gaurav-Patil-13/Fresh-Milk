const express = require('express');
const router = express.Router();
const {
  customerSignup,
  customerLogin,
  sellerLogin,
  createSeller,
  getMe
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Customer routes
router.post('/customer/signup', customerSignup);
router.post('/customer/login', customerLogin);

// Seller routes
router.post('/seller/login', sellerLogin);

// Admin routes
router.post('/admin/create-seller', protect, authorize('admin'), createSeller);

// Common routes
router.get('/me', protect, getMe);

module.exports = router;