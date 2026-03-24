const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            default: null,
        },
        orderReference: {
            type: String,
            default: '',
            trim: true,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
            validate: {
                validator: Number.isInteger,
                message: 'Rating must be an integer between 1 and 5',
            },
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 1000,
        },
    },
    { timestamps: true }
);

reviewSchema.index({ seller: 1, createdAt: -1 });
reviewSchema.index({ order: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', reviewSchema);
