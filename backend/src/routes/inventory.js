const express = require('express');
const router  = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  addMovement, getMovements, exportProducts, getInventoryUsers,
} = require('../controllers/inventoryController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('INVENTORY_MANAGER'));

router.get('/users', getInventoryUsers);
router.get('/movements',  getMovements);
router.post('/movements', addMovement);
router.get('/export', exportProducts);
router.route('/').get(getProducts).post(createProduct);
router.route('/:id').get(getProduct).put(updateProduct).delete(deleteProduct);

module.exports = router;
