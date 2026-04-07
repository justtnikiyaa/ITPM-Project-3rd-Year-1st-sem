const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
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
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null,
    },
    buyerNote: {
        type: String,
        default: ""
    },
    sellerNote: {
        type: String,
        default: ""
    }
}, { timestamps: true });

chatSchema.index({ orderId: 1 }, { unique: true });

module.exports = mongoose.model('Chat', chatSchema);
