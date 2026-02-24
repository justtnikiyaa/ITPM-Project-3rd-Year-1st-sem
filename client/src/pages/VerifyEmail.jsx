import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Mail, ShieldCheck, RefreshCw, ArrowRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VerifyEmail = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);

    const email = user?.email || '';

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setVerifying(true);
        try {
            const res = await axios.post(`${API_BASE}/api/auth/verify-otp`, {
                email,
                otp,
            });
            setSuccess(res.data.message || 'Email verified successfully!');
            // Update user state
            if (user) {
                updateUser({ ...user, isVerified: true });
            }
            // Redirect after a short delay
            setTimeout(() => {
                navigate(user?.isStudentSeller ? '/dashboard' : '/');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setSuccess('');
        setResending(true);
        try {
            const res = await axios.post(`${API_BASE}/api/auth/send-otp`, {
                email,
            });
            setSuccess(res.data.message || 'OTP sent successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };

    // If user is already verified, redirect
    if (user?.isVerified) {
        navigate(user?.isStudentSeller ? '/dashboard' : '/');
        return null;
    }

    return (
        <div className="auth-page-light">
            {/* Animated glow orbs */}
            <div className="glow-orb glow-orb--purple"></div>
            <div className="glow-orb glow-orb--teal"></div>
            <div className="glow-orb glow-orb--pink"></div>

            <div className="verify-email animate-fade-in-up">
                <div className="verify-email__icon-wrap">
                    <Mail className="verify-email__icon" />
                </div>

                <h1 className="verify-email__title">
                    Verify your <span className="gradient-text">Email</span>
                </h1>
                <p className="verify-email__subtitle">
                    We've sent a 6-digit verification code to
                </p>
                <p className="verify-email__email">{email}</p>

                <form onSubmit={handleVerify} className="verify-email__form">
                    {error && (
                        <div className="verify-email__alert verify-email__alert--error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="verify-email__alert verify-email__alert--success">
                            <ShieldCheck size={16} />
                            {success}
                        </div>
                    )}

                    <div className="verify-email__field">
                        <label className="verify-email__label">Verification Code</label>
                        <input
                            type="text"
                            className="verify-email__input"
                            placeholder="Enter 6-digit code"
                            value={otp}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setOtp(val);
                            }}
                            maxLength={6}
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={verifying || otp.length !== 6}
                        className="verify-email__btn verify-email__btn--primary"
                    >
                        {verifying ? (
                            <span className="verify-email__btn-loading">
                                <RefreshCw size={16} className="verify-email__spinner" />
                                Verifying...
                            </span>
                        ) : (
                            <>
                                <ShieldCheck size={18} />
                                Verify Email
                            </>
                        )}
                    </button>
                </form>

                <div className="verify-email__resend">
                    <p className="verify-email__resend-text">
                        Didn't receive the code?
                    </p>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending}
                        className="verify-email__btn verify-email__btn--resend"
                    >
                        {resending ? (
                            <span className="verify-email__btn-loading">
                                <RefreshCw size={14} className="verify-email__spinner" />
                                Sending...
                            </span>
                        ) : (
                            <>
                                <RefreshCw size={14} />
                                Resend OTP
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
