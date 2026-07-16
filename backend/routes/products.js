const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const adminAuth = require('../middleware/adminAuth');



router.get('/', productController.getAllProducts);
router.patch('/variants/:id/discount', adminAuth, productController.updateVariantDiscount);
router.get('/:id', productController.getProductById);
router.post('/', adminAuth, productController.createProduct);
router.patch('/:id', adminAuth, productController.updateProductStatus);
router.put('/:id', adminAuth, productController.updateProduct);
router.patch('/:id/status', adminAuth, productController.updateProductStatus);
router.delete('/:id', adminAuth, productController.deleteProduct);

module.exports = router;