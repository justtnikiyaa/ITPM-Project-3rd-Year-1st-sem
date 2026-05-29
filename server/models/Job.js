const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Job title is required'],
            trim: true,
            maxlength: 120,
        },
        description: {
            type: String,
            required: [true, 'Job description is required'],
            trim: true,
            maxlength: 2500,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
            maxlength: 80,
        },
        skills: {
            type: [String],
            default: [],
        },
        budget: {
            type: Number,
            required: [true, 'Budget is required'],
            min: [1, 'Budget must be a positive number'],
        },
        deliveryTime: {
            type: Number,
            required: [true, 'Delivery time is required'],
            min: [1, 'Delivery time must be at least 1 day'],
        },
        requirements: {
            type: String,
            default: '',
            trim: true,
            maxlength: 1200,
        },
        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Completed', 'Cancelled'],
            default: 'Open',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
