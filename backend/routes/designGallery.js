const express = require('express');
const router = express.Router();
const designGalleryController = require('../controllers/designGalleryController');
const adminAuth = require('../middleware/adminAuth');

router.post('/', adminAuth, designGalleryController.upsertDesignGallery);
router.delete('/:id', adminAuth, designGalleryController.deleteDesignGallery);
router.get('/:product_id/:color_name', designGalleryController.getGalleryByProductAndColor);
router.get('/:product_id', designGalleryController.getGalleriesByProduct);

module.exports = router;
