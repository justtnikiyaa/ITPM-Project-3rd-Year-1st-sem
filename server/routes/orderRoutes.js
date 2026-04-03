const express = require('express');
const { protect, requireBuyer, requireStudent } = require('../middleware/auth');
const {
    createOrder,
    getSellerOrders,
    getBuyerOrders,
    updateOrderStatus,
} = require('../controllers/orderController');

const router = express.Router();

router.post('/', protect, requireBuyer, createOrder);
router.get('/seller', protect, requireStudent, getSellerOrders);
router.get('/buyer', protect, requireBuyer, getBuyerOrders);
router.patch('/:id/status', protect, requireStudent, updateOrderStatus);

module.exports = router;
