const express = require('express');
const router = express.Router();
const {
  getAllMilkTypes,
  getSellersByMilkType,
  getMilkById,
  addMilk,
  updateMilk,
  deleteMilk,
  getMyMilkProducts
} = require('../controllers/milkController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/types', getAllMilkTypes);
router.get('/sellers/:milkType', getSellersByMilkType);
router.get('/:id', getMilkById);

// Seller routes
router.post('/', protect, authorize('seller'), addMilk);
router.put('/:id', protect, authorize('seller'), updateMilk);
router.delete('/:id', protect, authorize('seller'), deleteMilk);
router.get('/seller/my-products', protect, authorize('seller'), getMyMilkProducts);

module.exports = router;