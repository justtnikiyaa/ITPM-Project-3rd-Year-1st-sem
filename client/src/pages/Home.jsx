import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    Search,
    ArrowRight,
    Shield,
    Zap,
    DollarSign,
    Clock,
    Tag,
    User,
    ImagePlus,
    Loader2,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const categories = [
    { name: 'Web Development', badge: null },
    { name: 'Graphic Design', badge: 'POPULAR' },
    { name: 'Content Writing', badge: null },
    { name: 'Mobile App Dev', badge: 'TRENDING' },
    { name: 'Video Editing', badge: null },
    { name: 'AI & Machine Learning', badge: 'NEW' },
];

const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [services, setServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [activeCategory, setActiveCategory] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Fetch services on mount
    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async (search = '', category = '') => {
        setLoadingServices(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (category) params.append('category', category);
            const res = await axios.get(`/api/services?${params.toString()}`);
            setServices(res.data);
        } catch (err) {
            console.error('Failed to fetch services:', err);
        } finally {
            setLoadingServices(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setActiveCategory(null);
        fetchServices(searchQuery.trim());
    };

    const handleCategoryClick = (categoryName) => {
        if (activeCategory === categoryName) {
            setActiveCategory(null);
            fetchServices();
        } else {
            setActiveCategory(categoryName);
            setSearchQuery('');
            fetchServices('', categoryName);
        }
    };

    return (
        <div className="home-page-light">
            {/* ═══ Hero Section ═══ */}
            <div className="hero-section">
                {/* Animated glow orbs */}
                <div className="glow-orb glow-orb--purple"></div>
                <div className="glow-orb glow-orb--teal"></div>
                <div className="glow-orb glow-orb--pink"></div>

                <div className="hero-container">
                    <div className="hero-content animate-fade-in-up">
                        <h1 className="hero-heading">
                            Find the perfect
                            <br />
                            <span className="hero-heading-accent">student freelancer</span>
                            <br />
                            for your project
                        </h1>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="hero-search-wrapper">
                            <div className="hero-search-bar">
                                <Search className="hero-search-icon" />
                                <input
                                    type="text"
                                    className="hero-search-input"
                                    placeholder="Search for any service..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className="hero-search-btn">
                                    Search
                                    <ArrowRight className="hero-search-btn-arrow" />
                                </button>
                            </div>
                        </form>

                        {/* Category Tags */}
                        <div className="hero-categories">
                            <span className="hero-categories-label">Popular:</span>
                            <div className="hero-tags">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.name}
                                        onClick={() => handleCategoryClick(cat.name)}
                                        className={`hero-tag ${activeCategory === cat.name ? 'hero-tag--active' : ''
                                            }`}
                                    >
                                        {cat.name}
                                        {cat.badge && (
                                            <span
                                                className={`hero-tag-badge ${cat.badge === 'POPULAR'
                                                    ? 'hero-tag-badge--popular'
                                                    : cat.badge === 'TRENDING'
                                                        ? 'hero-tag-badge--trending'
                                                        : 'hero-tag-badge--new'
                                                    }`}
                                            >
                                                {cat.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="hero-trust animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="hero-trust-item">
                            <div className="hero-trust-icon hero-trust-icon--purple">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="hero-trust-value">Verified</div>
                                <div className="hero-trust-label">University Students</div>
                            </div>
                        </div>
                        <div className="hero-trust-divider"></div>
                        <div className="hero-trust-item">
                            <div className="hero-trust-icon hero-trust-icon--green">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="hero-trust-value">Fast</div>
                                <div className="hero-trust-label">Delivery Guaranteed</div>
                            </div>
                        </div>
                        <div className="hero-trust-divider"></div>
                        <div className="hero-trust-item">
                            <div className="hero-trust-icon hero-trust-icon--blue">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="hero-trust-value">Affordable</div>
                                <div className="hero-trust-label">Student-Friendly Rates</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ Service Grid Section ═══ */}
            <div className="service-grid-section">
                {/* Animated glow orbs */}
                <div className="glow-orb glow-orb--purple"></div>
                <div className="glow-orb glow-orb--teal"></div>
                <div className="glow-orb glow-orb--pink"></div>
                <div className="service-grid-container">
                    {/* Section Header */}
                    <div className="service-grid-header animate-fade-in-up">
                        <h2 className="text-3xl font-bold">
                            {activeCategory ? (
                                <>
                                    <span className="gradient-text">{activeCategory}</span> Services
                                </>
                            ) : searchQuery ? (
                                <>
                                    Results for &quot;<span className="gradient-text">{searchQuery}</span>&quot;
                                </>
                            ) : (
                                <>
                                    Discover <span className="gradient-text">Services</span>
                                </>
                            )}
                        </h2>
                        {(activeCategory || searchQuery) && (
                            <button
                                onClick={() => {
                                    setActiveCategory(null);
                                    setSearchQuery('');
                                    fetchServices();
                                }}
                                className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-light)] font-medium transition-colors"
                            >
                                ← Show all services
                            </button>
                        )}
                    </div>

                    {/* Loading State */}
                    {loadingServices ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="service-card-skeleton">
                                    <div className="service-card-skeleton__image animate-shimmer" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-3 w-20 rounded-full animate-shimmer" />
                                        <div className="h-4 w-full rounded-full animate-shimmer" />
                                        <div className="h-4 w-3/4 rounded-full animate-shimmer" />
                                        <div className="flex justify-between">
                                            <div className="h-3 w-16 rounded-full animate-shimmer" />
                                            <div className="h-5 w-24 rounded-full animate-shimmer" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : services.length === 0 ? (
                        /* Empty State */
                        <div className="glass-card p-16 text-center rounded-2xl animate-fade-in-up">
                            <div className="w-20 h-20 mx-auto rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
                                <Search className="w-10 h-10 text-[var(--color-primary)]" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No services found</h3>
                            <p className="text-[var(--color-text-muted)] text-sm max-w-md mx-auto">
                                {searchQuery || activeCategory
                                    ? 'Try a different search term or category.'
                                    : 'No services are available right now. Check back later!'}
                            </p>
                        </div>
                    ) : (
                        /* Service Cards Grid */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {services.map((service, index) => (
                                <div
                                    key={service._id}
                                    className="service-card animate-fade-in-up"
                                    style={{ animationDelay: `${index * 60}ms` }}
                                    onClick={() => navigate(`/service/${service._id}`)}
                                >
                                    {/* Thumbnail */}
                                    <div className="service-card__image">
                                        {service.coverImage ? (
                                            <img
                                                src={`${API_BASE}${service.coverImage}`}
                                                alt={service.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-accent)]/10">
                                                <ImagePlus className="w-10 h-10 text-[var(--color-text-muted)]/30" />
                                            </div>
                                        )}
                                        {/* Price Badge */}
                                        <div className="service-card__price">
                                            LKR {service.price?.toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-5">
                                        {/* Seller Info */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                                {service.seller?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs font-medium text-[var(--color-text-muted)] truncate">
                                                {service.seller?.name}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-sm font-bold mb-3 line-clamp-2 leading-snug text-[var(--color-text)]">
                                            {service.title}
                                        </h3>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                            <div className="flex items-center gap-1.5">
                                                <Tag className="w-3 h-3 text-[var(--color-accent)]" />
                                                <span className="text-[11px] font-medium text-[var(--color-accent)]">
                                                    {service.category}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-[11px]">{service.deliveryTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
