const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const {
    getUserProfile,
    updateOwnProfile,
    updateOwnPassword,
    getSellerPortfolio,
    getCompletedProjectsForSeller,
    getRatingSummary,
    getBuyerDashboard,
    getSellerEarnings,
} = require('../controllers/portfolioController');

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
        if (extname && mimetype) return cb(null, true);
        return cb(new Error('Only image files are allowed'));
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/me', protect, getUserProfile);
router.get('/me/buyer-dashboard', protect, getBuyerDashboard);
router.get('/me/earnings', protect, getSellerEarnings);
router.put('/me', protect, upload.single('profilePhoto'), updateOwnProfile);
router.put('/me/password', protect, updateOwnPassword);
router.get('/seller/:sellerId', getSellerPortfolio);
router.get('/seller/:sellerId/completed-projects', getCompletedProjectsForSeller);
router.get('/seller/:sellerId/rating-summary', getRatingSummary);

module.exports = router;
