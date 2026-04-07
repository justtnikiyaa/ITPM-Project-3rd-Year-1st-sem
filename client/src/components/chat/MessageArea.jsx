import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Send, Paperclip, Bot } from 'lucide-react';

const MessageArea = ({ chat }) => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);
    const [showChatbot, setShowChatbot] = useState(false);

    const isBuyer = chat?.buyer?._id === user?._id;
    const otherUser = isBuyer ? chat?.seller : chat?.buyer;
    
    const orderIdString = typeof chat?.orderId === 'object' ? chat?.orderId._id : chat?.orderId;

    useEffect(() => {
        if (!chat) return;

        const fetchMessages = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/chats/${chat._id}/messages`);
                setMessages(res.data);
            } catch (err) {
                console.error("Failed to load messages", err);
            }
        };

        fetchMessages();

        if (socket && orderIdString) {
            socket.emit('join_chat', orderIdString);

            socket.on('receive_message', (message) => {
                if (message.chatId === chat._id || message.isBot) {
                    setMessages((prev) => [...prev, message]);
                }
            });
        }

        return () => {
            if (socket) socket.off('receive_message');
        };
    }, [chat, socket, orderIdString]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const messageData = {
            chatId: chat._id,
            sender: user._id,
            receiverId: otherUser._id,
            text: newMessage,
            orderId: orderIdString
        };

        socket.emit('send_message', messageData);
        setNewMessage("");
    };

    const handleBotQuery = (queryType) => {
        if (!socket) return;

        let questionText = "";
        if (queryType === 'seller_stats') questionText = "Seller Product Count";
        else if (queryType === 'order_progress') questionText = "Order Progress";

        const messageData = {
            chatId: chat._id,
            sender: user._id,
            receiverId: otherUser._id,
            text: questionText,
            orderId: orderIdString
        };
        socket.emit('send_message', messageData);

        setTimeout(() => {
            socket.emit('chatbot_query', {
                queryType,
                chatId: chat._id,
                orderId: orderIdString,
                buyerId: user._id,
                sellerId: chat.seller._id
            });
        }, 300);
        
        setShowChatbot(false);
    };

    if (!chat) return <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">Select a chat to start messaging</div>;

    return (
        <div className="flex flex-col h-full relative">
            <div className="p-4 bg-white border-b flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <img src={otherUser?.profilePic || 'https://via.placeholder.com/40'} alt="Profile" className="w-10 h-10 rounded-full object-cover border" />
                    <div>
                        <h3 className="font-bold text-gray-800">{otherUser?.name || 'Unknown User'}</h3>
                        <p className="text-xs text-gray-500">Order #{String(orderIdString).substring(0, 8)}</p>
                    </div>
                </div>
                {isBuyer && (
                    <button onClick={() => setShowChatbot(!showChatbot)} className="flex items-center gap-2 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-200 transition">
                        <Bot size={16} /> Ask Bot
                    </button>
                )}
            </div>

            {showChatbot && isBuyer && (
                <div className="absolute top-16 right-4 bg-white border shadow-xl rounded-xl p-3 z-20 w-64 animate-fade-in-up">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">UniGig Assistant</h4>
                    <div className="flex flex-col gap-2">
                        <button onClick={() => handleBotQuery('seller_stats')} className="text-left text-sm bg-gray-50 hover:bg-indigo-50 p-2 rounded-lg transition border">
                            📊 View Seller Stats
                        </button>
                        <button onClick={() => handleBotQuery('order_progress')} className="text-left text-sm bg-gray-50 hover:bg-indigo-50 p-2 rounded-lg transition border">
                            🚀 Check Order Progress
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {messages.map((msg, index) => {
                    const isOwn = msg.sender?._id === user?._id;
                    const isBot = msg.isBot;
                    return (
                        <div key={index} className={`flex max-w-[75%] ${isOwn ? 'self-end' : 'self-start'}`}>
                            {!isOwn && (
                                <img src={otherUser?.profilePic || (isBot ? 'https://via.placeholder.com/40?text=Bot' : 'https://via.placeholder.com/40')} alt="User" className="w-8 h-8 rounded-full mr-2 mt-1 flex-shrink-0" />
                            )}
                            <div className={`p-3 rounded-2xl ${isOwn ? 'bg-blue-50 border border-blue-100 text-blue-950 rounded-tr-sm shadow-sm' : isBot ? 'bg-purple-100 text-purple-900 rounded-tl-sm border border-purple-200' : 'bg-white border rounded-tl-sm text-gray-800 shadow-sm'}`}>
                                {isBot && <p className="text-[10px] font-bold text-purple-600 mb-1 flex items-center gap-1"><Bot size={12}/> UniGig Bot</p>}
                                <p className="text-sm break-words">{msg.text}</p>
                                <p className={`text-[10px] mt-1 text-right ${isOwn ? 'text-blue-400' : 'text-gray-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex gap-2 items-center">
                <button type="button" className="p-2 text-gray-400 hover:text-indigo-600 transition bg-gray-50 rounded-full">
                    <Paperclip size={20} />
                </button>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                />
                <button disabled={!newMessage.trim()} type="submit" className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-10 h-10">
                    <Send size={18} className="translate-x-[1px]" />
                </button>
            </form>
        </div>
    );
};

export default MessageArea;
