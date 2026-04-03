const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect, requireBuyer, requireStudent } = require('../middleware/auth');
const {
    createOrder,
    getSellerOrders,
    getBuyerOrders,
    updateOrderStatus,
    deliverOrder,
    confirmDeliveredOrder,
} = require('../controllers/orderController');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const extname = allowed.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowed.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/', protect, requireBuyer, createOrder);
router.get('/seller', protect, requireStudent, getSellerOrders);
router.get('/buyer', protect, requireBuyer, getBuyerOrders);
router.patch('/:id/status', protect, requireStudent, updateOrderStatus);
router.patch('/:id/deliver', protect, requireStudent, upload.single('deliveryImage'), deliverOrder);
router.patch('/:id/confirm', protect, requireBuyer, confirmDeliveredOrder);

module.exports = router;
