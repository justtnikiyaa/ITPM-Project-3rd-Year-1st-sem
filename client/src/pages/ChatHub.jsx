import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatList from '../components/chat/ChatList';
import MessageArea from '../components/chat/MessageArea';
import { ArrowLeft } from 'lucide-react';

const ChatHub = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedChat, setSelectedChat] = useState(null);
    const initialChatId = location.state?.activeChatId || null;

    return (
        <div className="home-page-light min-h-screen pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 mb-4">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition font-medium bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border shadow-sm w-fit"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>
            </div>
            <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] px-4 flex gap-4">
                <div className="w-1/3 bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <ChatList 
                        onSelectChat={setSelectedChat} 
                        activeChatId={selectedChat?._id} 
                        initialChatId={initialChatId}
                    />
                </div>
                <div className="w-2/3 bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <MessageArea chat={selectedChat} />
                </div>
            </div>
        </div>
    );
};

export default ChatHub;
