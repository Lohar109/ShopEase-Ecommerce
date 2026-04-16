const express = require('express');
const router = express.Router();
const designGalleryController = require('../controllers/designGalleryController');

router.post('/', designGalleryController.upsertDesignGallery);
router.delete('/:id', designGalleryController.deleteDesignGallery);
router.get('/:product_id/:color_name', designGalleryController.getGalleryByProductAndColor);
router.get('/:product_id', designGalleryController.getGalleriesByProduct);

module.exports = router;
