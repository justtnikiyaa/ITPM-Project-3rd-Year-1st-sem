import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { MessageCircle } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { unreadCount, clearUnread } = useNotification();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isLightPage = true; // All pages use light theme

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const closeMobileMenu = () => {
        setMobileOpen(false);
    };

    return (
        <nav className={`navbar ${isLightPage ? 'navbar--light' : ''}`}>
            <div className="navbar-inner">
                <Link to="/" className="navbar-logo">
                    <img src="/logo.png" alt="UniGig" className="navbar-logo-img" />
                </Link>

                <div className="navbar-center-links">
                    <Link
                        to="/#services"
                        className={`navbar-link navbar-link--nav ${location.pathname === '/' ? 'navbar-link--active' : ''}`}
                    >
                        Browse Services
                    </Link>
                    <Link
                        to="/become-seller"
                        className={`navbar-link navbar-link--nav ${location.pathname === '/become-seller' ? 'navbar-link--active' : ''}`}
                    >
                        Become a Seller
                    </Link>
                </div>

                <div className="navbar-links navbar-links--actions">
                    {user ? (
                        <>
                            {user.isVerified ? (
                                <>
                                    {user.isStudentSeller && (
                                        <Link to="/dashboard" className="navbar-btn-primary">
                                            <svg
                                                className="navbar-btn-icon"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                                />
                                            </svg>
                                            Seller Dashboard
                                        </Link>
                                    )}
                                    <Link to="/profile/me" className="navbar-link">
                                        My Profile
                                    </Link>
                                </>
                            ) : (
                                <span className="navbar-link navbar-link--muted">
                                    Verify Email to Continue
                                </span>
                            )}

                            {/* Chat Icon */}
                            <Link 
                                to="/chat" 
                                onClick={clearUnread}
                                className="relative flex items-center justify-center p-2 text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer mr-2"
                                title="Messages"
                            >
                                <MessageCircle size={22} className="stroke-[2.5px]" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Link>

                            {/* User info */}
                            <div className="navbar-user">
                                <div className="navbar-avatar">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="navbar-user-info">
                                    <span className="navbar-user-name">{user.name}</span>
                                    <span
                                        className={`navbar-user-role ${user.isStudentSeller
                                            ? 'navbar-user-role--seller'
                                            : 'navbar-user-role--buyer'
                                            }`}
                                    >
                                        {user.isStudentSeller ? 'Seller' : 'Buyer'}
                                    </span>
                                </div>
                            </div>

                            <button onClick={handleLogout} className="navbar-link navbar-link--logout">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="navbar-link">
                                Sign In
                            </Link>
                            <Link to="/register" className="navbar-btn-join">
                                Create Account
                            </Link>
                        </>
                    )}
                </div>

                <button
                    className="navbar-mobile-toggle"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="navbar-mobile-icon">
                        {mobileOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {mobileOpen && (
                <div className="navbar-mobile-menu">
                    <Link to="/#services" className="navbar-mobile-link" onClick={closeMobileMenu}>
                        Browse Services
                    </Link>
                    <Link to="/become-seller" className="navbar-mobile-link" onClick={closeMobileMenu}>
                        Become a Seller
                    </Link>
                    {user ? (
                        <>
                            {user.isVerified ? (
                                <>
                                    {user.isStudentSeller && (
                                        <Link to="/dashboard" className="navbar-mobile-link" onClick={closeMobileMenu}>
                                            Seller Dashboard
                                        </Link>
                                    )}
                                    <Link to="/profile/me" className="navbar-mobile-link" onClick={closeMobileMenu}>
                                        My Profile
                                    </Link>
                                </>
                            ) : (
                                <span className="navbar-mobile-link navbar-mobile-link--muted">
                                    Verify Email to Continue
                                </span>
                            )}
                            <Link to="/chat" className="navbar-mobile-link flex justify-between items-center" onClick={() => { clearUnread(); closeMobileMenu(); }}>
                                <div className="flex items-center gap-2">
                                    <MessageCircle size={18} /> Messages
                                </div>
                                {unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{unreadCount > 9 ? '9+' : unreadCount}</span>
                                )}
                            </Link>

                            <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="navbar-mobile-link navbar-mobile-link--logout">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="navbar-mobile-link" onClick={closeMobileMenu}>
                                Sign In
                            </Link>
                            <Link to="/register" className="navbar-mobile-link navbar-mobile-link--join" onClick={closeMobileMenu}>
                                Create Account
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
