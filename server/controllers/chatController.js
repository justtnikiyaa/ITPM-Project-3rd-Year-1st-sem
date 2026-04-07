const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Order = require('../models/Order');

exports.getOrCreateChat = async (req, res) => {
    try {
        const { serviceId, buyerId, sellerId, orderId } = req.body;
        
        if (!buyerId || !sellerId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        let finalOrderId = orderId;

        if (!finalOrderId && serviceId) {
            let order = await Order.findOne({ serviceId, buyer: buyerId, seller: sellerId });
            if (!order) {
                order = new Order({
                    serviceId,
                    buyer: buyerId,
                    seller: sellerId,
                    price: 0
                });
                await order.save();
            }
            finalOrderId = order._id;
        }

        if (!finalOrderId) {
            return res.status(400).json({ message: 'Must provide orderId or serviceId' });
        }

        let chat = await Chat.findOne({ orderId: finalOrderId })
            .populate('buyer', 'name email profilePic')
            .populate('seller', 'name email profilePic')
            .populate('lastMessage');

        if (!chat) {
            chat = new Chat({
                orderId: finalOrderId,
                buyer: buyerId,
                seller: sellerId
            });
            await chat.save();
            chat = await Chat.findById(chat._id)
                .populate('buyer', 'name email profilePic')
                .populate('seller', 'name email profilePic');
        }

        res.status(200).json(chat);
    } catch (error) {
        console.error("Error getOrCreateChat:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getUserChats = async (req, res) => {
    try {
        const { userId } = req.params;
        const chats = await Chat.find({
            $or: [{ buyer: userId }, { seller: userId }]
        })
        .populate('buyer', 'name profilePic')
        .populate('seller', 'name profilePic')
        .populate('lastMessage')
        .populate('orderId')
        .sort({ updatedAt: -1 });

        res.status(200).json(chats);
    } catch (error) {
        console.error("Error getUserChats:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const messages = await Message.find({ chatId })
            .populate('sender', 'name profilePic')
            .sort({ createdAt: 1 });
            
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error getChatMessages:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
