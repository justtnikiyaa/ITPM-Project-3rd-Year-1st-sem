import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatList from '../components/chat/ChatList';
import MessageArea from '../components/chat/MessageArea';
import { ArrowLeft } from 'lucide-react';

const ChatHub = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedChat, setSelectedChat] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const initialChatId = location.state?.activeChatId || null;

    return (
        <div className="home-page-light min-h-screen pt-24 pb-6 relative overflow-hidden">
            {/* Animated glow orbs for background matching home page */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none blur-[100px] opacity-60">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-400/30 rounded-full mix-blend-multiply animate-blob"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-400/30 rounded-full mix-blend-multiply animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-pink-400/30 rounded-full mix-blend-multiply animate-blob animation-delay-4000"></div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 mb-4 relative z-10">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition font-medium bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border shadow-sm w-fit"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>
            </div>
            <div className="max-w-7xl mx-auto h-[calc(100vh-180px)] px-4 flex gap-4 relative z-10">
                <div className="w-1/3 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                    <ChatList 
                        onSelectChat={setSelectedChat} 
                        activeChatId={selectedChat?._id} 
                        initialChatId={initialChatId}
                        refreshTrigger={refreshTrigger}
                    />
                </div>
                <div className="w-2/3 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                    <MessageArea chat={selectedChat} onNoteUpdate={() => setRefreshTrigger(prev => prev + 1)} />
                </div>
            </div>
        </div>
    );
};

export default ChatHub;
