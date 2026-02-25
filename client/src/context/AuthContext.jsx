import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    // Synchronously initialize from localStorage to avoid race conditions
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('unigig_user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState(() => {
        const storedToken = localStorage.getItem('unigig_token');
        if (storedToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        return storedToken || null;
    });
    const [loading, setLoading] = useState(false); // Set to false since we initialize sync

    // Robust token handling via interceptor
    useEffect(() => {
        const interceptor = axios.interceptors.request.use(
            (config) => {
                const storedToken = localStorage.getItem('unigig_token');
                if (storedToken) {
                    config.headers.Authorization = `Bearer ${storedToken}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(interceptor);
        };
    }, []);

    const register = async (name, email, password) => {
        const res = await axios.post('/api/auth/register', {
            name,
            email,
            password,
        });
        const data = res.data;
        setUser(data);
        setToken(data.token);
        localStorage.setItem('unigig_user', JSON.stringify(data));
        localStorage.setItem('unigig_token', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        return data;
    };

    const login = async (email, password) => {
        const res = await axios.post('/api/auth/login', { email, password });
        const data = res.data;
        setUser(data);
        setToken(data.token);
        localStorage.setItem('unigig_user', JSON.stringify(data));
        localStorage.setItem('unigig_token', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        return data;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('unigig_user');
        localStorage.removeItem('unigig_token');
        delete axios.defaults.headers.common['Authorization'];
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('unigig_user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider
            value={{ user, token, loading, register, login, logout, updateUser }}
        >
            {children}
        </AuthContext.Provider>
    );
};
