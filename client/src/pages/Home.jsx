import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Search,
    ArrowRight,
    Shield,
    Zap,
    DollarSign,
    Clock,
    Tag,
    ImagePlus,
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

const benefits = [
    {
        icon: Shield,
        title: 'Verified University Students',
        description: 'Find skilled student freelancers backed by a university-focused marketplace you can trust.',
        tone: 'purple',
    },
    {
        icon: Zap,
        title: 'Fast Delivery Guaranteed',
        description: 'Move quickly with student talent built for quick turnarounds, demos, and deadline-driven work.',
        tone: 'blue',
    },
    {
        icon: DollarSign,
        title: 'Affordable Student Pricing',
        description: 'Launch projects with flexible budgets and rates that make sense for startups and campus teams.',
        tone: 'teal',
    },
];

const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [services, setServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [activeCategory, setActiveCategory] = useState(null);
    const navigate = useNavigate();
    const servicesSectionRef = useRef(null);

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

    const scrollToServices = () => {
        servicesSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setActiveCategory(null);
        await fetchServices(searchQuery.trim());
        scrollToServices();
    };

    const handleCategoryClick = async (categoryName) => {
        if (activeCategory === categoryName) {
            setActiveCategory(null);
            await fetchServices();
        } else {
            setActiveCategory(categoryName);
            setSearchQuery('');
            await fetchServices('', categoryName);
        }
        scrollToServices();
    };

    return (
        <div className="home-page-light">
            <section className="hero-section">
                <div className="glow-orb glow-orb--purple"></div>
                <div className="glow-orb glow-orb--teal"></div>
                <div className="glow-orb glow-orb--pink"></div>

                <div className="hero-container">
                    <div className="hero-content animate-fade-in-up">
                        <h1 className="hero-heading">
                            Find the perfect <span className="hero-heading-accent">student freelancer</span>
                            <br className="hero-heading-break" />
                            for your project
                        </h1>

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
                                    <span>Search</span>
                                    <ArrowRight className="hero-search-btn-arrow" />
                                </button>
                            </div>
                        </form>

                        <div className="hero-categories">
                            <div className="hero-tags">
                                {categories.map((cat) => (
                                    <div key={cat.name} className="hero-tag-wrap">
                                        {cat.badge && (
                                            <span
                                                className={`hero-tag-badge hero-tag-badge--floating ${cat.badge === 'POPULAR'
                                                    ? 'hero-tag-badge--popular'
                                                    : cat.badge === 'TRENDING'
                                                        ? 'hero-tag-badge--trending'
                                                        : 'hero-tag-badge--new'
                                                    }`}
                                            >
                                                {cat.badge}
                                            </span>
                                        )}
                                        <button
                                            onClick={() => handleCategoryClick(cat.name)}
                                            className={`hero-tag ${activeCategory === cat.name ? 'hero-tag--active' : ''
                                                }`}
                                        >
                                            {cat.name}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="hero-benefits animate-fade-in-up" style={{ animationDelay: '0.18s' }}>
                            {benefits.map(({ icon: Icon, title, description, tone }) => (
                                <article key={title} className="hero-benefit-card">
                                    <div className={`hero-benefit-icon hero-benefit-icon--${tone}`}>
                                        <Icon />
                                    </div>
                                    <h3 className="hero-benefit-title">{title}</h3>
                                    <p className="hero-benefit-description">{description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="services" ref={servicesSectionRef} className="service-grid-section">
                <div className="glow-orb glow-orb--purple"></div>
                <div className="glow-orb glow-orb--teal"></div>

                <div className="service-grid-container">
                    <div className="service-grid-header animate-fade-in-up">
                        <div>
                            <span className="service-grid-kicker">Browse student services</span>
                            <h2 className="service-grid-title">
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
                        </div>
                        {(activeCategory || searchQuery) && (
                            <button
                                onClick={() => {
                                    setActiveCategory(null);
                                    setSearchQuery('');
                                    fetchServices();
                                }}
                                className="service-grid-reset"
                            >
                                Show all services
                            </button>
                        )}
                    </div>

                    {loadingServices ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {services.map((service, index) => {
                                const packagePrices = (service.packages || [])
                                    .map((pkg) => Number(pkg?.price))
                                    .filter((price) => Number.isFinite(price));
                                const packageDeliveryDays = (service.packages || [])
                                    .map((pkg) => Number(pkg?.deliveryDays))
                                    .filter((days) => Number.isFinite(days) && days > 0);

                                const cardPrice = Number(service.price) > 0
                                    ? Number(service.price)
                                    : (packagePrices.length ? Math.min(...packagePrices) : 0);
                                const cardDelivery = service.deliveryTime || (packageDeliveryDays.length
                                    ? `${Math.min(...packageDeliveryDays)} Day${Math.min(...packageDeliveryDays) === 1 ? '' : 's'}`
                                    : '1 Week');

                                return <div
                                    key={service._id}
                                    className="service-card animate-fade-in-up"
                                    style={{ animationDelay: `${index * 60}ms` }}
                                    onClick={() => navigate(`/service/${service._id}`)}
                                >
                                    <div className="service-card__image">
                                        {service.coverImage ? (
                                            <img
                                                src={`${API_BASE}${service.coverImage}`}
                                                alt={service.title}
                                                className="w-full h-full object-cover transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-accent)]/10">
                                                <ImagePlus className="w-10 h-10 text-[var(--color-text-muted)]/30" />
                                            </div>
                                        )}
                                        <span className="service-card__price">
                                            LKR {cardPrice.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="p-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                                {service.seller?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs font-medium text-[var(--color-text-muted)] truncate">
                                                {service.seller?.name}
                                            </span>
                                        </div>

                                        <h3 className="text-sm font-bold mb-3 line-clamp-2 leading-snug text-[var(--color-text)]">
                                            {service.title}
                                        </h3>

                                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                            <div className="flex items-center gap-1.5">
                                                <Tag className="w-3 h-3 text-[var(--color-accent)]" />
                                                <span className="text-[11px] font-medium text-[var(--color-accent)]">
                                                    {service.category}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-[11px]">{cardDelivery}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>;
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
