import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BuyerRegister = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
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
                        Join <span className="gradient-text">UniGig</span>
                    </h1>
                    <p className="auth-page-light__subtitle">
                        Create your buyer account to discover talented university students
                    </p>
                </div>

                {/* Buyer Info */}
                <div className="auth-page-light__info-banner auth-page-light__info-banner--buyer">
                    <div className="auth-page-light__info-icon">🛒</div>
                    <div>
                        <p className="auth-page-light__info-title">
                            Buyer Account
                        </p>
                        <p className="auth-page-light__info-text">
                            As a buyer, you can browse and hire talented university students for your projects.
                            Any email address is accepted.
                        </p>
                    </div>
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
                        <label className="auth-page-light__label">Full Name</label>
                        <input
                            type="text"
                            className="auth-page-light__input"
                            placeholder="Your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

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
                            placeholder="Min. 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="auth-page-light__btn auth-page-light__btn--buyer"
                    >
                        {submitting ? (
                            <span className="auth-page-light__btn-loading">
                                <svg className="auth-page-light__spinner" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Creating Account...
                            </span>
                        ) : (
                            'Create Buyer Account'
                        )}
                    </button>

                    <div className="auth-page-light__footer-links">
                        <p className="auth-page-light__footer-text">
                            Are you a university student?{' '}
                            <Link to="/become-seller" className="auth-page-light__link auth-page-light__link--accent">
                                🎓 Become a Seller
                            </Link>
                        </p>
                        <p className="auth-page-light__footer-text">
                            Already have an account?{' '}
                            <Link to="/login" className="auth-page-light__link">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BuyerRegister;
