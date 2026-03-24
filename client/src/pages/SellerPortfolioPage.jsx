import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import ReviewsList from '../components/portfolio/ReviewsList';
import CompletedProjects from '../components/portfolio/CompletedProjects';
import AddReviewForm from '../components/portfolio/AddReviewForm';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const toImageUrl = (path) => (path?.startsWith('http') ? path : `${API_BASE}${path || ''}`);

function SellerPortfolioPage() {
    const { sellerId } = useParams();
    const { user } = useAuth();
    const [portfolio, setPortfolio] = useState(null);
    const [stats, setStats] = useState({ averageRating: 0, totalRatings: 0, totalReviews: 0, totalCompletedProjects: 0 });
    const [projects, setProjects] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadPortfolioData = async () => {
        setLoading(true);
        setError('');
        try {
            const [portfolioRes, statsRes, projectsRes, reviewsRes] = await Promise.all([
                apiClient.get(`/api/portfolio/seller/${sellerId}`),
                apiClient.get(`/api/portfolio/seller/${sellerId}/rating-summary`),
                apiClient.get(`/api/portfolio/seller/${sellerId}/completed-projects`),
                apiClient.get(`/api/reviews/seller/${sellerId}`),
            ]);
            setPortfolio(portfolioRes.data);
            setStats(statsRes.data);
            setProjects(projectsRes.data);
            setReviews(reviewsRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load portfolio');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPortfolioData();
    }, [sellerId]);

    return (
        <section className="profile-page-light">
            <div className="page-wrap">
            {error ? <p className="text-error">{error}</p> : null}
            {loading ? <p className="portfolio-muted">Loading seller portfolio...</p> : null}
            {portfolio ? (
                <>
                    <div className="portfolio-hero-card">
                        <div className="portfolio-head-row">
                            <h2 className="portfolio-hero-name">{portfolio.seller.name}</h2>
                            <Link to="/" className="btn-secondary">Back to services</Link>
                        </div>
                        <div className="portfolio-highlight-strip">
                            <div className="portfolio-highlight-item">
                                <span className="label">Avg Rating</span>
                                <strong>{stats.averageRating.toFixed(1)} / 5</strong>
                            </div>
                            <div className="portfolio-highlight-item">
                                <span className="label">Completed</span>
                                <strong>{stats.totalCompletedProjects}</strong>
                            </div>
                            <div className="portfolio-highlight-item">
                                <span className="label">Reviews</span>
                                <strong>{stats.totalReviews}</strong>
                            </div>
                            <div className="portfolio-highlight-item">
                                <span className="label">Top Skill</span>
                                <strong>{portfolio.seller.skills?.[0] || 'Not added yet'}</strong>
                            </div>
                        </div>
                        <div className="portfolio-hero-main">
                            {portfolio.seller.profileImage ? (
                                <img src={toImageUrl(portfolio.seller.profileImage)} alt={portfolio.seller.name} className="portfolio-hero-avatar" />
                            ) : (
                                <div className="portfolio-hero-avatar fallback">{portfolio.seller.name?.charAt(0).toUpperCase()}</div>
                            )}
                            <div className="portfolio-hero-content">
                                <p className="portfolio-email">{portfolio.seller.email}</p>
                                <p className="portfolio-bio">{portfolio.seller.bio || 'No bio provided yet.'}</p>
                                <p><strong>Portfolio:</strong> {portfolio.seller.portfolioSummary || 'No summary available.'}</p>
                                <div className="portfolio-skills-wrap">
                                    {(portfolio.seller.skills?.length ? portfolio.seller.skills : ['No skills listed']).map((skill) => (
                                        <span key={skill} className="portfolio-skill-pill">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <h3 className="portfolio-section-title">Completed Projects</h3>
                    <CompletedProjects projects={projects} loading={loading} resolveImage={toImageUrl} />
                    <h3 className="portfolio-section-title">Reviews</h3>
                    <ReviewsList reviews={reviews} loading={loading} />
                    {user ? (
                        user.isStudentSeller ? (
                            <div className="portfolio-card">
                                <h3>Add Review</h3>
                                <p className="portfolio-muted">Seller accounts can view reviews, but only buyer accounts can submit ratings and reviews.</p>
                            </div>
                        ) : (
                            <AddReviewForm sellerId={sellerId} onSuccess={loadPortfolioData} />
                        )
                    ) : (
                        <div className="portfolio-card">
                            <h3>Add Review</h3>
                            <p className="portfolio-muted">Please login with a buyer account to submit a review.</p>
                        </div>
                    )}
                </>
            ) : null}
            </div>
        </section>
    );
}

export default SellerPortfolioPage;
