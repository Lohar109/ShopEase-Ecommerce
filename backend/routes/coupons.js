const express = require('express');
const couponController = require('../controllers/couponController');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

router.get('/', couponController.getAllCoupons);
router.get('/:id', couponController.getCouponById);
router.post('/', adminAuth, couponController.createCoupon);
router.put('/:id', adminAuth, couponController.updateCoupon);
router.patch('/:id/status', adminAuth, couponController.updateCouponStatus);
router.delete('/:id', adminAuth, couponController.deleteCoupon);

module.exports = router;
