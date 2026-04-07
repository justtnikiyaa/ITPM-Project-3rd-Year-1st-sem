import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const { socket } = useSocket();

    useEffect(() => {
        if (socket) {
            socket.on('new_notification', (data) => {
                setNotification(data);

                if (!window.location.pathname.includes('/chat')) {
                    setUnreadCount(prev => prev + 1);
                }

                try {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.value = 880;
                    gain.gain.setValueAtTime(0.1, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
                    osc.start(ctx.currentTime);
                    osc.stop(ctx.currentTime + 0.5);
                } catch (e) {
                    console.error("Audio playback failed", e);
                }

                setTimeout(() => setNotification(null), 10000);
            });
        }
    }, [socket]);

    const clearNotification = () => setNotification(null);
    const clearUnread = () => setUnreadCount(0);

    return (
        <NotificationContext.Provider value={{ notification, clearNotification, unreadCount, clearUnread }}>
            {children}
            {notification && (
                <div 
                    className="fixed bottom-4 right-4 bg-white border border-indigo-100 shadow-xl rounded-xl p-4 max-w-sm w-full z-50 cursor-pointer hover:shadow-2xl transition-all transform animate-fade-in-up"
                    onClick={() => {
                        console.log(`Navigating to chat ${notification.chatId}`);
                        clearNotification();
                    }}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                💬
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{notification.title}</h4>
                                <p className="text-sm text-gray-600 truncate max-w-[200px]">{notification.message}</p>
                            </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); clearNotification(); }} className="text-gray-400 hover:text-gray-600">&times;</button>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};
