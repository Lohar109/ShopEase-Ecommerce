const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/send-otp', userController.sendOtp);
router.post('/verify-otp', userController.verifyOtp);

// Profile and Address routes
router.get('/users/profile', userController.getUserProfile);
router.put('/users/profile', userController.updateUserProfile);
router.get('/users/address', userController.getUserAddress);
router.put('/users/address', userController.updateUserAddress);

module.exports = router;
