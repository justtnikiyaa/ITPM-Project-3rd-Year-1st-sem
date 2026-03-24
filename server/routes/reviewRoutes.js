const express = require('express');
const { protect } = require('../middleware/auth');
const { getReviewsForSeller, createReview } = require('../controllers/reviewController');

const router = express.Router();

router.get('/seller/:sellerId', getReviewsForSeller);
router.post('/', protect, createReview);

module.exports = router;
