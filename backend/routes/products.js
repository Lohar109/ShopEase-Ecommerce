const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');



router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.patch('/:id', productController.updateProductStatus);
router.put('/:id', productController.updateProduct);
router.patch('/:id/status', productController.updateProductStatus);
router.delete('/:id', productController.deleteProduct);

module.exports = router;