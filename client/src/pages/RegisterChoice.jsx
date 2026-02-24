import { Link } from 'react-router-dom';
import { GraduationCap, ShoppingBag, ArrowRight } from 'lucide-react';

const RegisterChoice = () => {
    return (
        <div className="auth-page-light">
            {/* Animated glow orbs */}
            <div className="glow-orb glow-orb--purple"></div>
            <div className="glow-orb glow-orb--teal"></div>
            <div className="glow-orb glow-orb--pink"></div>

            <div className="register-choice animate-fade-in-up">
                <div className="register-choice__header">
                    <h1 className="register-choice__title">
                        Join <span className="gradient-text">UniGig</span>
                    </h1>
                    <p className="register-choice__subtitle">
                        Choose how you'd like to get started
                    </p>
                </div>

                <div className="register-choice__cards">
                    {/* Seller Card */}
                    <Link to="/become-seller" className="register-choice__card register-choice__card--seller">
                        <div className="register-choice__card-icon register-choice__card-icon--seller">
                            <GraduationCap />
                        </div>
                        <h2 className="register-choice__card-title">Become a Seller</h2>
                        <p className="register-choice__card-desc">
                            Offer your skills and earn money. Exclusively for verified Sri Lankan university students.
                        </p>
                        <ul className="register-choice__card-features">
                            <li>🎓 University email required</li>
                            <li>💼 Create and manage gigs</li>
                            <li>💰 Set your own prices</li>
                        </ul>
                        <div className="register-choice__card-btn register-choice__card-btn--seller">
                            Get Started
                            <ArrowRight />
                        </div>
                    </Link>

                    {/* Buyer Card */}
                    <Link to="/register/buyer" className="register-choice__card register-choice__card--buyer">
                        <div className="register-choice__card-icon register-choice__card-icon--buyer">
                            <ShoppingBag />
                        </div>
                        <h2 className="register-choice__card-title">Create Buyer Account</h2>
                        <p className="register-choice__card-desc">
                            Browse and hire talented university students for your projects. Any email is accepted.
                        </p>
                        <ul className="register-choice__card-features">
                            <li>🔍 Discover student talent</li>
                            <li>📋 Hire for your projects</li>
                            <li>⭐ Rate and review sellers</li>
                        </ul>
                        <div className="register-choice__card-btn register-choice__card-btn--buyer">
                            Get Started
                            <ArrowRight />
                        </div>
                    </Link>
                </div>

                <p className="register-choice__footer">
                    Already have an account?{' '}
                    <Link to="/login" className="register-choice__link">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterChoice;
