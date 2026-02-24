import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('unigig_user');
        const storedToken = localStorage.getItem('unigig_token');
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setLoading(false);
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
