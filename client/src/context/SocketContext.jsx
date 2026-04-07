import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children, userId }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        if (userId) {
            const newSocket = io('http://localhost:5000');
            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Connected to socket server');
                newSocket.emit('user_online', userId);
            });

            newSocket.on('online_users', (users) => {
                setOnlineUsers(users);
            });

            return () => {
                newSocket.close();
            };
        }
    }, [userId]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
