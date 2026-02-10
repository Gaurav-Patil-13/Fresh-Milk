const express = require('express');
const router = express.Router();
const {
  createRating,
  getSellerRatings,
  getMilkRatings,
  getCustomerRatings,
  getSellerReceivedRatings,
  updateRating,
  deleteRating
} = require('../controllers/ratingController');
const { protect, authorize } = require('../middleware/auth');

// Customer routes
router.post('/', protect, authorize('customer'), createRating);
router.get('/customer', protect, authorize('customer'), getCustomerRatings);
router.put('/:id', protect, authorize('customer'), updateRating);
router.delete('/:id', protect, authorize('customer'), deleteRating);

// Seller routes
router.get('/seller/received', protect, authorize('seller'), getSellerReceivedRatings);

// Public routes
router.get('/seller/:sellerId', getSellerRatings);
router.get('/milk/:milkId', getMilkRatings);

module.exports = router;