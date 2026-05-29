import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import ReviewsList from '../components/portfolio/ReviewsList';
import CompletedProjects from '../components/portfolio/CompletedProjects';
import AddReviewForm from '../components/portfolio/AddReviewForm';
import SocialLinks from '../components/portfolio/SocialLinks';
import ImageLightbox from '../components/portfolio/ImageLightbox';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ChevronDown, Filter, LayoutGrid, Star, MessageSquare, Briefcase } from 'lucide-react';

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
    const [sortBy, setSortBy] = useState('latest');
    const [lightbox, setLightbox] = useState({ isOpen: false, url: '', title: '' });
    const currentUserId = user?._id || user?.id || '';

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

    const handleUpdateReview = async (reviewId, payload) => {
        await apiClient.patch(`/api/reviews/${reviewId}`, payload);
        await loadPortfolioData();
    };

    const handleDeleteReview = async (reviewId) => {
        await apiClient.delete(`/api/reviews/${reviewId}`);
        await loadPortfolioData();
    };

    const sortedReviews = [...reviews].sort((a, b) => {
        if (sortBy === 'latest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'rating-high') return b.rating - a.rating;
        if (sortBy === 'rating-low') return a.rating - b.rating;
        return 0;
    });

    return (
        <section className="profile-page-light min-h-screen bg-[#f8f9ff]">
            <div className="page-wrap animate-fade-in">
            {error ? <p className="text-error">{error}</p> : null}
            {loading ? (
                <div className="portfolio-skeleton" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="h-64 bg-white/50 backdrop-blur-md rounded-2xl animate-pulse"></div>
                    <div className="h-10 w-48 bg-white/50 rounded-lg animate-pulse"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/50 rounded-2xl animate-pulse"></div>)}
                    </div>
                </div>
            ) : null}
            {portfolio ? (
                <>
                    <div className="portfolio-hero-card glass-card overflow-hidden border-none shadow-2xl mb-10">
                        <div className="bg-gradient-to-br from-[#4a3fb9] via-[#6c63ff] to-[#8b5cf6] p-8 text-white relative">
                            <div className="absolute top-0 right-0 p-10 opacity-10">
                                <LayoutGrid size={120} />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <Link to="/" className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                                        <ArrowLeft size={20} />
                                    </Link>
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tight">{portfolio.seller.name}</h2>
                                        <div className="flex items-center gap-2 mt-1 opacity-80">
                                            <span className="text-sm font-medium">{portfolio.seller.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <Link to="/" className="px-6 py-2 bg-white text-[#4a3fb9] font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                                    Browse All Services
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col">
                                    <div className="flex items-center gap-2 mb-1 opacity-70">
                                        <Star size={14} className="fill-current" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Avg Rating</span>
                                    </div>
                                    <strong className="text-2xl font-black">{stats.averageRating.toFixed(1)} <span className="text-sm font-normal opacity-70">/ 5</span></strong>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col">
                                    <div className="flex items-center gap-2 mb-1 opacity-70">
                                        <Briefcase size={14} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
                                    </div>
                                    <strong className="text-2xl font-black">{stats.totalCompletedProjects}</strong>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col">
                                    <div className="flex items-center gap-2 mb-1 opacity-70">
                                        <MessageSquare size={14} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Reviews</span>
                                    </div>
                                    <strong className="text-2xl font-black">{stats.totalReviews}</strong>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col">
                                    <div className="flex items-center gap-2 mb-1 opacity-70">
                                        <Filter size={14} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Top Skill</span>
                                    </div>
                                    <strong className="text-xl font-black truncate">{portfolio.seller.skills?.[0] || 'N/A'}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white flex flex-col md:flex-row gap-10">
                            <div className="md:w-1/4 flex flex-col items-center">
                                {portfolio.seller.profileImage ? (
                                    <img 
                                        src={toImageUrl(portfolio.seller.profileImage)} 
                                        alt={portfolio.seller.name} 
                                        className="w-48 h-48 rounded-3xl object-cover shadow-2xl border-4 border-white -mt-24 relative z-20" 
                                    />
                                ) : (
                                    <div 
                                        className="w-48 h-48 rounded-3xl shadow-2xl border-4 border-white -mt-24 relative z-20 flex items-center justify-center bg-[#e2e2ec] text-[#4a3fb9] text-5xl font-black"
                                    >
                                        {portfolio.seller.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                
                                <SocialLinks 
                                    linkedin={portfolio.seller.linkedinUrl} 
                                    github={portfolio.seller.githubUrl} 
                                    website={portfolio.seller.portfolioWebsite} 
                                />

                                <div className="mt-8 w-full">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 px-2">Skills & Expertise</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(portfolio.seller.skills?.length ? portfolio.seller.skills : ['No skills listed']).map((skill) => (
                                            <span key={skill} className="px-3 py-1.5 bg-[#f0f0ff] text-[#4a3fb9] text-xs font-bold rounded-lg border border-[#e5e5ff]">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="md:w-3/4">
                                <div className="prose prose-slate max-w-none">
                                    <div className="mb-8">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-[#4a3fb9] mb-2">About Me</h4>
                                        <p className="text-gray-600 leading-relaxed font-medium">{portfolio.seller.bio || 'This student seller is still working on their bio.'}</p>
                                    </div>
                                    
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Portfolio Highlights</h4>
                                            <p className="text-sm text-gray-700 font-medium leading-relaxed">{portfolio.seller.portfolioSummary || 'No summary available.'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Experience & Education</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <span className="text-[10px] font-black text-[#4a3fb9] uppercase">History</span>
                                                    <p className="text-sm text-gray-700 font-medium mt-1">{portfolio.seller.workExperience || 'Not added yet.'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black text-[#4a3fb9] uppercase">Academic</span>
                                                    <p className="text-sm text-gray-700 font-medium mt-1">{portfolio.seller.educationCertifications || 'Not added yet.'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black text-[#1a1a2e]">Completed Projects</h3>
                            <div className="h-1 flex-1 mx-6 bg-gray-100 rounded-full"></div>
                        </div>
                        <CompletedProjects 
                            projects={projects} 
                            loading={loading} 
                            resolveImage={toImageUrl} 
                            onImageClick={(url, title) => setLightbox({ isOpen: true, url, title })}
                        />
                    </div>

                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black text-[#1a1a2e]">Student Reviews</h3>
                            <div className="flex items-center gap-3">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort by:</label>
                                <div className="relative">
                                    <select 
                                        className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4a3fb9] transition-all cursor-pointer shadow-sm"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="latest">Latest</option>
                                        <option value="rating-high">Highest Rated</option>
                                        <option value="rating-low">Lowest Rated</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-2">
                                <ReviewsList
                                    reviews={sortedReviews}
                                    loading={loading}
                                    currentUserId={currentUserId}
                                    onUpdateReview={handleUpdateReview}
                                    onDeleteReview={handleDeleteReview}
                                />
                            </div>
                            <div className="lg:col-span-1">
                                {user ? (
                                    user.isStudentSeller ? (
                                        <div className="bg-[#f0f0ff] p-8 rounded-3xl border border-[#e5e5ff] shadow-inner text-center">
                                            <h4 className="text-lg font-black text-[#4a3fb9] mb-2">Internal View</h4>
                                            <p className="text-sm text-[#4a3fb9]/70 font-bold leading-relaxed">As a student seller, you can read and manage your reviews, but only buyer accounts can post new ratings.</p>
                                        </div>
                                    ) : (
                                        <div className="glass-card p-1">
                                            <AddReviewForm sellerId={sellerId} onSuccess={loadPortfolioData} />
                                        </div>
                                    )
                                ) : (
                                    <div className="bg-gray-100 p-8 rounded-3xl border border-gray-200 text-center">
                                        <h4 className="text-lg font-black text-gray-400 mb-2">Join to Review</h4>
                                        <p className="text-sm text-gray-400 font-bold leading-relaxed">Please log in with a buyer account to share your experience with {portfolio.seller.name}.</p>
                                        <Link to="/login" className="mt-4 inline-block px-6 py-2 bg-gray-200 text-gray-600 font-black rounded-xl hover:bg-gray-300 transition-colors">Login Now</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <ImageLightbox 
                        isOpen={lightbox.isOpen} 
                        imageUrl={lightbox.url} 
                        title={lightbox.title} 
                        onClose={() => setLightbox({ ...lightbox, isOpen: false })} 
                    />
                </>
            ) : null}
            </div>
        </section>
    );
}

export default SellerPortfolioPage;
