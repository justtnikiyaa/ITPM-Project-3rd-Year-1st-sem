const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: true,
        },
        titleSnapshot: {
            type: String,
            default: '',
        },
        descriptionSnapshot: {
            type: String,
            default: '',
        },
        deliveredImage: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
            default: 'Pending',
        },
        completedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
