import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const sriLankaUniRegex =
    /(@.*\.ac\.lk$|@my\.sliit\.lk$|@students\.nsbm\.ac\.lk$|@nsbm\.ac\.lk$|@kdu\.ac\.lk$|@cinec\.edu$)/;

const BecomeASeller = () => {
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

        // Client-side university email validation
        if (!sriLankaUniRegex.test(email)) {
            setError(
                'Only Sri Lankan university emails are allowed for seller accounts. Use a .ac.lk, my.sliit.lk, or similar university email.'
            );
            return;
        }

        setSubmitting(true);
        try {
            await register(name, email, password);
            navigate('/verify-email');
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
                    <div className="auth-page-light__badge">
                        <span className="auth-page-light__badge-icon">🎓</span>
                        <span>For University Students Only</span>
                    </div>
                    <h1 className="auth-page-light__title">
                        Become a <span className="gradient-text">Seller</span>
                    </h1>
                    <p className="auth-page-light__subtitle">
                        Offer your skills and earn — exclusively for verified Sri Lankan university students
                    </p>
                </div>

                {/* University Info Banner */}
                <div className="auth-page-light__info-banner">
                    <div className="auth-page-light__info-icon">🏫</div>
                    <div>
                        <p className="auth-page-light__info-title">
                            University Email Required
                        </p>
                        <p className="auth-page-light__info-text">
                            You must register with a valid Sri Lankan university email to become a seller. Accepted domains include:{' '}
                            <code className="auth-page-light__code">.ac.lk</code>,{' '}
                            <code className="auth-page-light__code">my.sliit.lk</code>,{' '}
                            <code className="auth-page-light__code">students.nsbm.ac.lk</code>,{' '}
                            <code className="auth-page-light__code">kdu.ac.lk</code>,{' '}
                            <code className="auth-page-light__code">cinec.edu</code>
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
                        <label className="auth-page-light__label">
                            University Email
                            <span className="auth-page-light__label-required">*</span>
                        </label>
                        <input
                            type="email"
                            className="auth-page-light__input"
                            placeholder="you@university.ac.lk"
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
                        className="auth-page-light__btn"
                    >
                        {submitting ? (
                            <span className="auth-page-light__btn-loading">
                                <svg className="auth-page-light__spinner" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Creating Seller Account...
                            </span>
                        ) : (
                            <>
                                🎓 Create Seller Account
                            </>
                        )}
                    </button>

                    <div className="auth-page-light__footer-links">
                        <p className="auth-page-light__footer-text">
                            Want to hire instead?{' '}
                            <Link to="/register" className="auth-page-light__link">
                                Create a Buyer Account
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

export default BecomeASeller;
