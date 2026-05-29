const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function() { return !this.isBot; }
    },
    isBot: {
        type: Boolean,
        default: false
    },
    text: {
        type: String,
        default: '',
    },
    fileUrl: {
        type: String,
        default: null,
    },
    isRead: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
