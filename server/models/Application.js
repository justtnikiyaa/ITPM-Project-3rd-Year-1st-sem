const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
    {
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
            required: true,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        message: {
            type: String,
            required: [true, 'Proposal message is required'],
            trim: true,
            maxlength: 2000,
        },
        proposedPrice: {
            type: Number,
            required: [true, 'Proposed price is required'],
            min: [1, 'Proposed price must be a positive number'],
        },
        deliveryTime: {
            type: Number,
            required: [true, 'Delivery time is required'],
            min: [1, 'Delivery time must be at least 1 day'],
        },
        status: {
            type: String,
            enum: ['Pending', 'Accepted', 'Rejected'],
            default: 'Pending',
        },
    },
    { timestamps: true }
);

applicationSchema.index({ job: 1, seller: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
