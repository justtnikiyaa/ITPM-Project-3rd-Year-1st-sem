import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isLightPage = true; // All pages use light theme

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className={`navbar ${isLightPage ? 'navbar--light' : ''}`}>
            <div className="navbar-inner">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <img src="/logo.png" alt="UniGig" className="navbar-logo-img" />
                </Link>

                {/* Desktop Nav Links */}
                <div className="navbar-links">
                    {user ? (
                        <>
                            {/* Post a Gig — only for student sellers */}
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
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                    Post a Gig
                                </Link>
                            )}

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

                {/* Mobile menu toggle */}
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

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="navbar-mobile-menu">
                    {user ? (
                        <>
                            {user.isStudentSeller && (
                                <Link to="/dashboard" className="navbar-mobile-link" onClick={() => setMobileOpen(false)}>
                                    Post a Gig
                                </Link>
                            )}
                            <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="navbar-mobile-link navbar-mobile-link--logout">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="navbar-mobile-link" onClick={() => setMobileOpen(false)}>
                                Sign In
                            </Link>
                            <Link to="/register" className="navbar-mobile-link navbar-mobile-link--join" onClick={() => setMobileOpen(false)}>
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
