const { Server } = require('socket.io');
const Message = require('./models/Message');
const Chat = require('./models/Chat');
const Order = require('./models/Order');

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    const onlineUsers = new Map();

    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.id}`);

        socket.on('user_online', (userId) => {
            onlineUsers.set(userId, socket.id);
            io.emit('online_users', Array.from(onlineUsers.keys()));
        });

        socket.on('join_chat', (orderId) => {
            socket.join(orderId);
            console.log(`User joined chat room for order: ${orderId}`);
        });

        socket.on('send_message', async (messageData) => {
            try {
                const newMessage = new Message({
                    chatId: messageData.chatId,
                    sender: messageData.sender,
                    text: messageData.text,
                    fileUrl: messageData.fileUrl
                });
                const savedMessage = await newMessage.save();

                await Chat.findByIdAndUpdate(messageData.chatId, { lastMessage: savedMessage._id });

                const populatedMessage = await Message.findById(savedMessage._id).populate('sender', 'name profilePic');

                io.to(messageData.orderId).emit('receive_message', populatedMessage);

                const receiverSocketId = onlineUsers.get(messageData.receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('new_notification', {
                        title: "New Message",
                        message: populatedMessage.text || "Sent an attachment",
                        chatId: messageData.chatId,
                        orderId: messageData.orderId
                    });
                }
            } catch (error) {
                console.error("Socket error processing message", error);
            }
        });

        socket.on('chatbot_query', async (data) => {
            try {
                let responseText = "I'm sorry, I couldn't process that request.";

                if (data.queryType === 'seller_stats') {
                    responseText = "This seller has 5 active services on UniGig.";
                } else if (data.queryType === 'order_progress') {
                    if (data.orderId) {
                        const order = await Order.findById(data.orderId);
                        responseText = order ? `The current status of your order is: ${order.status}` : "Order not found.";
                    } else {
                        responseText = "Order progression is currently tracked in the order dashboard.";
                    }
                }

                const botMessage = new Message({
                    chatId: data.chatId,
                    isBot: true,
                    text: responseText
                });
                const savedMessage = await botMessage.save();

                io.to(data.orderId).emit('receive_message', {
                    _id: savedMessage._id,
                    chatId: data.chatId,
                    isBot: true,
                    text: responseText,
                    sender: { name: "UniGig Bot" },
                    createdAt: savedMessage.createdAt
                });

            } catch (error) {
                console.error("Chatbot Error:", error);
            }
        });

        socket.on('disconnect', () => {
            for (let [key, value] of onlineUsers.entries()) {
                if (value === socket.id) {
                    onlineUsers.delete(key);
                    break;
                }
            }
            io.emit('online_users', Array.from(onlineUsers.keys()));
            console.log(`🔌 User disconnected: ${socket.id}`);
        });
    });

    return io;
};

module.exports = setupSocket;
