const express = require('express');
const { protect } = require('../middleware/auth');
const { createOrder, markOrderCompleted, getMyOrders } = require('../controllers/orderController');

const router = express.Router();

router.get('/me', protect, getMyOrders);
router.post('/', protect, createOrder);
router.patch('/:id/complete', protect, markOrderCompleted);

module.exports = router;
