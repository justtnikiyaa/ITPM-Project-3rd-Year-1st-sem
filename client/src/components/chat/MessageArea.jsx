import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Send, Paperclip, Bot, Pencil, Check } from 'lucide-react';

const MessageArea = ({ chat, onNoteUpdate }) => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [showChatbot, setShowChatbot] = useState(false);

    const isBuyer = chat?.buyer?._id === user?._id;
    const [note, setNote] = useState("");
    const [isEditingNote, setIsEditingNote] = useState(false);

    const otherUser = isBuyer ? chat?.seller : chat?.buyer;
    
    const orderIdString = typeof chat?.orderId === 'object' ? chat?.orderId._id : chat?.orderId;

    useEffect(() => {
        if (!chat) return;
        setNote(isBuyer ? chat?.buyerNote : chat?.sellerNote || "");

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

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !socket || isUploading) return;

        setIsUploading(true);
        let fileUrl = null;

        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            try {
                const res = await axios.post('http://localhost:5000/api/chats/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                fileUrl = res.data.fileUrl;
            } catch (err) {
                console.error("File upload failed", err);
                setIsUploading(false);
                return;
            }
        }

        const messageData = {
            chatId: chat._id,
            sender: user._id,
            receiverId: otherUser._id,
            text: newMessage,
            orderId: orderIdString,
            fileUrl: fileUrl
        };

        socket.emit('send_message', messageData);
        setNewMessage("");
        setSelectedFile(null);
        setIsUploading(false);
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const renderAttachment = (url) => {
        if (!url) return null;
        const ext = url.split('.').pop().toLowerCase();
        if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
            return (
                <img src={url} alt="Attachment" className="max-w-[200px] h-auto rounded mt-2 border border-black/10 cursor-pointer hover:opacity-90 transition" onClick={() => window.open(url, '_blank')} />
            );
        } else {
            return (
                <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 mt-2 bg-black/5 p-2 rounded text-sm hover:underline border border-black/5 w-fit">
                    <Paperclip size={14} /> Document Attachment
                </a>
            );
        }
    };

    const handleSaveNote = async () => {
        try {
            await axios.patch(`http://localhost:5000/api/chats/${chat._id}/note`, {
                userId: user._id,
                note
            });
            setIsEditingNote(false);
            if (isBuyer) chat.buyerNote = note;
            else chat.sellerNote = note;
            if (onNoteUpdate) onNoteUpdate();
        } catch (err) {
            console.error("Failed to save note", err);
        }
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
                    <img src={otherUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'User')}&background=E0E7FF&color=3730A3&bold=true`} alt="Profile" className="w-10 h-10 rounded-full object-cover border" />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-800">{otherUser?.name || 'Unknown User'}</h3>
                            <span className="text-xs text-gray-400">#{String(orderIdString).substring(0, 8)}</span>
                        </div>
                        {isEditingNote ? (
                            <div className="flex items-center gap-2 mt-0.5">
                                <input
                                    autoFocus
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Add a private note..."
                                    className="text-xs border border-indigo-200 rounded px-2 py-0.5 focus:outline-none focus:border-indigo-400 w-40 bg-indigo-50"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveNote()}
                                />
                                <button onClick={handleSaveNote} className="text-white bg-indigo-500 hover:bg-indigo-600 p-0.5 rounded transition">
                                    <Check size={12} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mt-0.5 group cursor-pointer w-fit" onClick={() => setIsEditingNote(true)}>
                                <p className={`text-xs ${note ? 'text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded' : 'text-gray-400 italic'}`}>
                                    {note || "Add private note..."}
                                </p>
                                <button className="text-gray-400 opacity-0 group-hover:opacity-100 transition hover:text-indigo-600">
                                    <Pencil size={12} />
                                </button>
                            </div>
                        )}
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

                    const messageDateObj = new Date(msg.createdAt);
                    const messageDateStr = messageDateObj.toLocaleDateString();
                    const prevMessageDateStr = index > 0 ? new Date(messages[index - 1].createdAt).toLocaleDateString() : null;
                    const showDate = messageDateStr !== prevMessageDateStr;
                    
                    let displayDate = messageDateStr;
                    if (showDate) {
                        const today = new Date().toLocaleDateString();
                        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
                        if (messageDateStr === today) displayDate = 'Today';
                        else if (messageDateStr === yesterday) displayDate = 'Yesterday';
                        else displayDate = messageDateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
                    }

                    return (
                        <React.Fragment key={index}>
                            {showDate && (
                                <div className="w-full flex justify-center my-1">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 bg-gray-100 shadow-sm border border-gray-200 px-3 py-1 rounded-full">
                                        {displayDate}
                                    </span>
                                </div>
                            )}
                            <div className={`flex max-w-[75%] gap-2 ${isOwn ? 'self-end' : 'self-start'}`}>
                            {!isOwn && (
                                <img src={otherUser?.profilePic || (isBot ? 'https://ui-avatars.com/api/?name=Bot&background=E9D5FF&color=6B21A8&bold=true' : `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'User')}&background=E0E7FF&color=3730A3&bold=true`)} alt="User" className="w-8 h-8 rounded-full mr-2 mt-1 flex-shrink-0" />
                            )}
                            <div className={`p-3 rounded-2xl ${isOwn ? 'bg-blue-50 border border-blue-100 text-blue-950 rounded-tr-sm shadow-sm' : isBot ? 'bg-purple-100 text-purple-900 rounded-tl-sm border border-purple-200' : 'bg-white border rounded-tl-sm text-gray-800 shadow-sm'}`}>
                                {isBot && <p className="text-[10px] font-bold text-purple-600 mb-1 flex items-center gap-1"><Bot size={12}/> UniGig Bot</p>}
                                {msg.text && <p className="text-sm break-words">{msg.text}</p>}
                                {renderAttachment(msg.fileUrl)}
                                <p className={`text-[10px] mt-1 text-right ${isOwn ? 'text-blue-400' : 'text-gray-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            </div>
                        </React.Fragment>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex flex-col gap-2">
                {selectedFile && (
                    <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg text-sm border border-indigo-100 w-fit">
                        <Paperclip size={14} />
                        <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                        <button type="button" onClick={() => setSelectedFile(null)} className="ml-2 text-indigo-400 hover:text-indigo-600">×</button>
                    </div>
                )}
                <div className="flex gap-2 items-center">
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-gray-400 hover:text-indigo-600 transition bg-gray-50 rounded-full">
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                    />
                    <button disabled={(!newMessage.trim() && !selectedFile) || isUploading} type="submit" className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-10 h-10">
                        {isUploading ? <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></span> : <Send size={18} className="translate-x-[1px]" />}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MessageArea;
