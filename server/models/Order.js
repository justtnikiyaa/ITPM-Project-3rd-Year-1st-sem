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
        packageId: {
            type: String,
            default: '',
        },
        packageName: {
            type: String,
            required: true,
            trim: true,
        },
        packageDescription: {
            type: String,
            default: '',
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        deliveryDays: {
            type: Number,
            required: true,
            min: 1,
        },
        deliveryTime: {
            type: String,
            required: true,
            trim: true,
        },
        requirementsMessage: {
            type: String,
            required: true,
            trim: true,
            maxlength: 3000,
        },
        orderDate: {
            type: Date,
            default: Date.now,
        },
        deliveredImage: {
            type: String,
            default: '',
        },
        deliveryNote: {
            type: String,
            default: '',
            trim: true,
            maxlength: 3000,
        },
        deliveredAt: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Delivered', 'Completed', 'Cancelled'],
            default: 'Pending',
        },
        completedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ buyer: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
