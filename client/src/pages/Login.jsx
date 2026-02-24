import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const data = await login(email, password);
            // Sellers go to dashboard, buyers go to home
            navigate(data.isStudentSeller ? '/dashboard' : '/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page-light">
            {/* Animated glow orbs */}
            <div className="glow-orb glow-orb--purple"></div>
            <div className="glow-orb glow-orb--teal"></div>
            <div className="glow-orb glow-orb--pink"></div>

            <div className="auth-page-light__container animate-fade-in-up">
                {/* Header */}
                <div className="auth-page-light__header">
                    <h1 className="auth-page-light__title">
                        Welcome Back to <span className="gradient-text">UniGig</span>
                    </h1>
                    <p className="auth-page-light__subtitle">
                        Sign in to continue your journey
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-page-light__form">
                    {error && (
                        <div className="auth-page-light__error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className="auth-page-light__field">
                        <label className="auth-page-light__label">Email Address</label>
                        <input
                            type="email"
                            className="auth-page-light__input"
                            placeholder="you@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-page-light__field">
                        <label className="auth-page-light__label">Password</label>
                        <input
                            type="password"
                            className="auth-page-light__input"
                            placeholder="Your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="auth-page-light__btn"
                    >
                        {submitting ? (
                            <span className="auth-page-light__btn-loading">
                                <svg className="auth-page-light__spinner" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Signing In...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    <div className="auth-page-light__footer-links">
                        <p className="auth-page-light__footer-text">
                            Don&apos;t have an account?{' '}
                            <Link to="/register" className="auth-page-light__link">
                                Create Buyer Account
                            </Link>
                        </p>
                        <p className="auth-page-light__footer-text">
                            University student?{' '}
                            <Link to="/become-seller" className="auth-page-light__link auth-page-light__link--accent">
                                🎓 Become a Seller
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
