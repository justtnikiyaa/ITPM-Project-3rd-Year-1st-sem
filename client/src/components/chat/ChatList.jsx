import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const ChatList = ({ onSelectChat, activeChatId, initialChatId }) => {
    const { user } = useAuth();
    const { onlineUsers } = useSocket();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            if (!user) return;
            try {
                const res = await axios.get(`http://localhost:5000/api/chats/user/${user._id}`);
                setChats(res.data);
                
                if (initialChatId && !activeChatId) {
                    const activeChat = res.data.find(c => c._id === initialChatId);
                    if (activeChat) {
                        onSelectChat(activeChat);
                    }
                } else if (!activeChatId && res.data.length > 0) {
                    onSelectChat(res.data[0]);
                }
            } catch (error) {
                console.error('Failed to fetch chats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchChats();
    }, [user]);

    if (loading) return <div className="p-4 text-center text-gray-500">Loading chats...</div>;

    if (chats.length === 0) {
        return <div className="p-4 text-center text-gray-500">No active chats</div>;
    }

    return (
        <div className="flex flex-col h-full bg-white border-r">
            <div className="p-4 border-b bg-gray-50 font-black text-gray-800 text-lg sticky top-0 z-10">
                Messages
            </div>
            <div className="overflow-y-auto flex-1">
                {chats.map((chat) => {
                    const otherUser = chat.buyer?._id === user._id ? chat.seller : chat.buyer;
                    const isOnline = otherUser ? onlineUsers.includes(otherUser._id) : false;
                    const isSelected = activeChatId === chat._id;

                    return (
                        <div
                            key={chat._id}
                            onClick={() => onSelectChat(chat)}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition flex items-center gap-3 ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                        >
                            <div className="relative">
                                <img
                                    src={otherUser?.profilePic || 'https://via.placeholder.com/40'}
                                    alt={otherUser?.name || 'User'}
                                    className="w-10 h-10 rounded-full object-cover bg-gray-200"
                                />
                                {isOnline && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-800 truncate">{otherUser?.name || 'Unknown User'}</h4>
                                <p className="text-sm text-gray-500 truncate">
                                    {chat.lastMessage?.text || "Started a chat"}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChatList;
