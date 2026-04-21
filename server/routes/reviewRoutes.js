const express = require('express');
const { protect, requireBuyer } = require('../middleware/auth');
const { getReviewsForSeller, createReview, updateReview, deleteReview, getMyReviews } = require('../controllers/reviewController');

const router = express.Router();

router.get('/me', protect, requireBuyer, getMyReviews);
router.get('/seller/:sellerId', getReviewsForSeller);
router.post('/', protect, requireBuyer, createReview);
router.patch('/:reviewId', protect, requireBuyer, updateReview);
router.delete('/:reviewId', protect, requireBuyer, deleteReview);

module.exports = router;
