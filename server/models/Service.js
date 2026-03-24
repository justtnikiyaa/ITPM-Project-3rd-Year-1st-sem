const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['Basic', 'Standard', 'Premium'],
    },
    description: String,
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
    revisions: {
        type: Number,
        default: 0,
        min: 0,
    },
    features: [String],
});

const addonSchema = new mongoose.Schema({
    title: String,
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    deliveryDays: {
        type: Number,
        default: 0,
    },
});

const requirementSchema = new mongoose.Schema({
    question: String,
    type: {
        type: String,
        enum: ['text', 'number', 'checkbox', 'radio', 'file'],
        default: 'text',
    },
    options: [String],
    required: {
        type: Boolean,
        default: true,
    },
});

const serviceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        shortDescription: {
            type: String,
            default: '',
            maxlength: 150,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
        },
        // Legacy price field (for backward compatibility)
        price: {
            type: Number,
            default: 0,
            min: 0,
        },
        coverImage: {
            type: String,
            default: '',
        },
        galleryImages: [String],
        deliveryTime: {
            type: String,
            default: '1 Week',
        },
        // Enhanced Pricing Packages
        packages: [packageSchema],
        // Add-ons
        addons: [addonSchema],
        // Seller Requirements/Questions
        requirements: [requirementSchema],
        // Tags/Skills
        tags: [String],
        // Revisions
        revisionsIncluded: {
            type: Number,
            default: 1,
            min: 0,
        },
        // Rush Delivery
        rushDeliveryAvailable: {
            type: Boolean,
            default: false,
        },
        rushDeliveryPrice: {
            type: Number,
            default: 0,
            min: 0,
        },
        rushDeliveryDays: {
            type: Number,
            default: 1,
            min: 1,
        },
        // Gig Status
        status: {
            type: String,
            enum: ['active', 'paused', 'draft'],
            default: 'active',
        },
        // Seller
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // Statistics
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalReviews: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalOrders: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
