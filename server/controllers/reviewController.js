const mongoose = require('mongoose');
const Review = require('../models/Review');
const Order = require('../models/Order');

const getReviewsForSeller = async (req, res) => {
    try {
        const { sellerId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(sellerId)) {
            return res.status(400).json({ message: 'Invalid seller id' });
        }

        const reviews = await Review.find({ seller: sellerId })
            .populate('buyer', 'name')
            .sort({ createdAt: -1 });

        const shaped = reviews.map((review) => ({
            _id: review._id,
            order: review.order,
            rating: review.rating,
            comment: review.comment,
            reviewerName: review.buyer?.name || 'Anonymous',
            createdAt: review.createdAt,
        }));

        res.json(shaped);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const createReview = async (req, res) => {
    try {
        if (req.user?.isStudentSeller) {
            return res.status(403).json({ message: 'Only buyer accounts can submit reviews' });
        }

        const { orderId, sellerId, rating, comment } = req.body;
        const parsedRating = Number(rating);

        if (!orderId || !comment || Number.isNaN(parsedRating)) {
            return res.status(400).json({ message: 'orderId, rating and comment are required' });
        }
        if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
        }
        const orderIdText = String(orderId).trim();
        let reviewPayload = null;

        if (mongoose.Types.ObjectId.isValid(orderIdText)) {
            const order = await Order.findById(orderIdText);
            if (order) {
                if (String(order.buyer) !== String(req.user._id)) {
                    return res.status(403).json({ message: 'Only the buyer of this order can review' });
                }
                if (order.status !== 'Completed') {
                    return res.status(400).json({ message: 'Review allowed only for completed orders' });
                }

                const existingReview = await Review.findOne({ order: orderIdText });
                if (existingReview) {
                    return res.status(409).json({ message: 'A review already exists for this order' });
                }

                reviewPayload = {
                    order: orderIdText,
                    orderReference: orderIdText,
                    seller: order.seller,
                    buyer: req.user._id,
                    rating: parsedRating,
                    comment: String(comment).trim(),
                };
            }
        }

        // Demo/testing fallback: accept any numeric order ID without DB existence verification
        if (!reviewPayload) {
            if (!/^\d+$/.test(orderIdText)) {
                return res.status(400).json({ message: 'Order ID must be numeric for demo submission' });
            }
            if (!sellerId || !mongoose.Types.ObjectId.isValid(String(sellerId))) {
                return res.status(400).json({ message: 'Valid sellerId is required for demo review submission' });
            }

            const existingDemoReview = await Review.findOne({
                orderReference: orderIdText,
                seller: sellerId,
                buyer: req.user._id,
            });
            if (existingDemoReview) {
                return res.status(409).json({ message: 'A review already exists for this demo order ID' });
            }

            reviewPayload = {
                // Use synthetic ObjectId in demo mode to avoid collisions
                // with legacy unique indexes on `order`.
                order: new mongoose.Types.ObjectId(),
                orderReference: orderIdText,
                seller: sellerId,
                buyer: req.user._id,
                rating: parsedRating,
                comment: String(comment).trim(),
            };
        }

        const review = await Review.create(reviewPayload);

        res.status(201).json(review);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'A review already exists for this order' });
        }
        res.status(500).json({ message: error?.message || 'Server error' });
    }
};

module.exports = { getReviewsForSeller, createReview };
