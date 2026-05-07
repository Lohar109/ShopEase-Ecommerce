const express = require('express');
const couponController = require('../controllers/couponController');

const router = express.Router();

router.get('/', couponController.getAllCoupons);
router.get('/:id', couponController.getCouponById);
router.post('/', couponController.createCoupon);
router.put('/:id', couponController.updateCoupon);
router.patch('/:id/status', couponController.updateCouponStatus);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;
