import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CreateGigForm from '../components/CreateGigForm';
import {
    Plus,
    Edit3,
    Upload,
    ImagePlus,
    X,
    Clock,
    Tag,
    Sparkles,
    LayoutDashboard,
    Zap,
    Moon,
    Trash2,
    Wallet,
} from 'lucide-react';

// we rely on Vite's dev server proxy so that all `/api` requests
// are treated as same‑origin. using an absolute URL (API_BASE) causes
// cross‑origin requests which sometimes trigger CORS/preflight issues
// and can result in intermittent 401/Network errors when returning to
// the dashboard. keep paths relative and let the proxy handle the host.
const API_BASE = import.meta.env.VITE_API_URL || ''; // leave blank for relative paths
const ASSET_BASE = (API_BASE.replace(/\/api\/?$/, '') || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
// helper to create full url for assets from backend uploads
const assetUrl = (rawPath) => {
    if (!rawPath) return '';

    if (/^https?:\/\//i.test(rawPath)) {
        return rawPath;
    }

    const normalized = String(rawPath).replace(/\\/g, '/');
    const withLeadingSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;

    return `${ASSET_BASE}${withLeadingSlash}`;
};


const SellerDashboard = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [gigs, setGigs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingGig, setEditingGig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deletingIds, setDeletingIds] = useState([]);
    const [earnings, setEarnings] = useState({
        totalEarnings: 0,
        monthlyEarnings: 0,
        pendingPayments: 0,
        currency: 'LKR',
    });

    // Redirect non-sellers
    useEffect(() => {
        if (user && !user.isStudentSeller) {
            navigate('/');
        }
    }, [user, navigate]);

    // Load seller's gigs
    const fetchGigs = useCallback(async () => {
        try {
            setError('');
            setLoading(true);
            const res = await axios.get('/api/services/my');
            setGigs(res.data);
            console.log(`Loaded ${res.data.length} gigs`);
        } catch (err) {
            console.error('Failed to load gigs:', err.response || err.message || err);
            const message = err.response?.data?.message;
            if (err.response?.status === 404 && message === 'Service not found') {
                setGigs([]);
                setError('');
            } else {
                setError(
                    message || 'Failed to load your gigs. Please try again.'
                );
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.isStudentSeller) fetchGigs();
    }, [user, fetchGigs]);

    const fetchEarnings = useCallback(async () => {
        try {
            const res = await axios.get('/api/portfolio/me/earnings');
            setEarnings(res.data);
        } catch (err) {
            console.error('Failed to load earnings:', err);
        }
    }, []);

    useEffect(() => {
        if (user?.isStudentSeller) fetchEarnings();
    }, [user, fetchEarnings]);

    // Hide the navbar while the create gig modal is open to maximize viewport space.
    useEffect(() => {
        if (showForm) {
            document.body.classList.add('seller-modal-open');
        } else {
            document.body.classList.remove('seller-modal-open');
        }

        return () => {
            document.body.classList.remove('seller-modal-open');
        };
    }, [showForm]);

    // Toggle availability
    const handleToggleAvailability = async () => {
        setToggling(true);
        try {
            const res = await axios.patch('/api/users/availability');
            updateUser({ ...user, availability: res.data.availability });
        } catch (err) {
            console.error('Toggle failed:', err);
        } finally {
            setToggling(false);
        }
    };

    // Delete a gig
    const handleDelete = async (gigId) => {
        if (!window.confirm('Are you sure you want to delete this gig?')) return;
        setDeletingIds((prev) => [...prev, gigId]);
        try {
            await axios.delete(`/api/services/${gigId}`);
            setGigs((prev) => prev.filter((g) => g._id !== gigId));
            setSuccess('Gig deleted successfully.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete gig. Please try again.');
        } finally {
            setDeletingIds((prev) => prev.filter((id) => id !== gigId));
        }
    };

    // Handle successful gig creation
    const handleGigSaved = (savedGig) => {
        if (editingGig?._id) {
            setGigs((prev) => prev.map((gig) => (gig._id === savedGig._id ? savedGig : gig)));
        } else {
            setGigs((prev) => [savedGig, ...prev]);
        }
        setEditingGig(null);
        setShowForm(false);
        setSuccess(editingGig?._id ? '✅ Gig updated successfully!' : '✅ Gig created successfully!');
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleOpenCreate = () => {
        setEditingGig(null);
        setShowForm(true);
    };

    const handleOpenEdit = (gig) => {
        setEditingGig(gig);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingGig(null);
    };

    if (!user?.isStudentSeller) return null;

    const isActive = user?.availability === 'Active';

    return (
        <div className="seller-dash-light">
            {/* Animated glow orbs */}
            <div className="glow-orb glow-orb--purple"></div>
            <div className="glow-orb glow-orb--teal"></div>
            <div className="glow-orb glow-orb--pink"></div>

            <div className="seller-dash-light__inner">
                {/* ── Dashboard Header ── */}
                <div className="seller-dash-light__header animate-fade-in-up">
                    <div className="seller-dash-light__title-group">
                        <div className="seller-dash-light__icon-box">
                            <LayoutDashboard />
                        </div>
                        <div>
                            <h1 className="seller-dash-light__title">
                                Seller <span className="gradient-text">Dashboard</span>
                            </h1>
                            <p className="seller-dash-light__subtitle">
                                Manage your gigs and availability
                            </p>
                        </div>
                    </div>

                    <div className="seller-dash-light__actions">
                        {/* ── Availability Toggle ── */}
                        <div className="seller-dash-light__avail-card">
                            <div className="seller-dash-light__avail-label">
                                {isActive ? (
                                    <Zap style={{ color: '#22c55e' }} />
                                ) : (
                                    <Moon style={{ color: '#f59e0b' }} />
                                )}
                                <span>Status</span>
                            </div>
                            <button
                                onClick={handleToggleAvailability}
                                disabled={toggling}
                                className={`toggle-switch ${isActive ? 'active' : ''}`}
                                aria-label="Toggle availability"
                            />
                            <span
                                className={`seller-dash-light__avail-status ${isActive
                                    ? 'seller-dash-light__avail-status--active'
                                    : 'seller-dash-light__avail-status--away'
                                    }`}
                            >
                                {isActive ? 'Active' : 'Away'}
                            </span>
                            {isActive && (
                                <span className="seller-dash-light__pulse">
                                    <span className="seller-dash-light__pulse-ring"></span>
                                    <span className="seller-dash-light__pulse-dot"></span>
                                </span>
                            )}
                        </div>

                        {/* ── New Gig Button ── */}
                        <button
                            onClick={handleOpenCreate}
                            className="seller-dash-light__new-btn"
                        >
                            <Plus />
                            Create New Gig
                        </button>
                    </div>
                </div>

                <div className="seller-earnings-grid animate-fade-in-up">
                    <div className="seller-earnings-card">
                        <div className="seller-earnings-label"><Wallet size={16} />Total Earnings</div>
                        <div className="seller-earnings-value">
                            {earnings.currency} {Number(earnings.totalEarnings || 0).toLocaleString()}
                        </div>
                    </div>
                    <div className="seller-earnings-card">
                        <div className="seller-earnings-label"><Wallet size={16} />Monthly Earnings</div>
                        <div className="seller-earnings-value">
                            {earnings.currency} {Number(earnings.monthlyEarnings || 0).toLocaleString()}
                        </div>
                    </div>
                    <div className="seller-earnings-card pending">
                        <div className="seller-earnings-label"><Wallet size={16} />Pending Payments</div>
                        <div className="seller-earnings-value">
                            {earnings.currency} {Number(earnings.pendingPayments || 0).toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* ── Success/Error Messages ── */}
                {success && (
                    <div className="seller-dash-light__msg seller-dash-light__msg--success animate-fade-in-up">
                        <Sparkles />
                        {success}
                    </div>
                )}
                {error && (
                    <div className="seller-dash-light__msg seller-dash-light__msg--error animate-fade-in-up">
                        <X />
                        {error}
                    </div>
                )}

                {/* ═══ Modal Form ═══ */}
                {showForm && (
                    <div className="seller-modal-overlay">
                        <div className="seller-modal-content">
                            <button
                                type="button"
                                onClick={handleCloseForm}
                                className="seller-modal-close"
                            >
                                <X size={24} />
                            </button>
                            <CreateGigForm
                                onSuccess={handleGigSaved}
                                onCancel={handleCloseForm}
                                initialGig={editingGig}
                            />
                        </div>
                    </div>
                )}

                {/* ═══ My Gigs Grid ═══ */}
                {/* ── Gigs Grid ── */}
                <div className="seller-dash-light__grid-header">
                    <h2 className="seller-dash-light__section-title">
                        My <span className="gradient-text">Gigs</span>
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium opacity-60">
                            {gigs.length} {gigs.length === 1 ? 'gig' : 'gigs'} found
                        </span>
                        <button
                            onClick={fetchGigs}
                            disabled={loading}
                            className="p-2 rounded-full hover:bg-black/5 transition-colors"
                            title="Reload gigs"
                        >
                            <Sparkles className={loading ? 'animate-spin' : ''} size={18} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="seller-dash-light__skeleton seller-dash-light__skeleton-shimmer" style={{ height: '256px' }} />
                        ))}
                    </div>
                ) : gigs.length === 0 ? (
                    <div className="seller-dash-light__empty">
                        <div className="seller-dash-light__empty-icon">
                            <Sparkles />
                        </div>
                        <h3>No gigs yet</h3>
                        <p>Create your first gig and start earning!</p>
                        <button
                            onClick={handleOpenCreate}
                            className="seller-dash-light__empty-btn"
                        >
                            <Plus />
                            Create Your First Gig
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gigs.map((gig, index) => {
                            const packagePrices = (gig.packages || [])
                                .map((pkg) => Number(pkg?.price))
                                .filter((price) => Number.isFinite(price));
                            const packageDeliveryDays = (gig.packages || [])
                                .map((pkg) => Number(pkg?.deliveryDays))
                                .filter((days) => Number.isFinite(days) && days > 0);

                            const gigPrice = Number(gig.price) > 0
                                ? Number(gig.price)
                                : (packagePrices.length ? Math.min(...packagePrices) : 0);
                            const gigDelivery = gig.deliveryTime || (packageDeliveryDays.length
                                ? `${Math.min(...packageDeliveryDays)} Day${Math.min(...packageDeliveryDays) === 1 ? '' : 's'}`
                                : '1 Week');

                            return <div
                                key={gig._id}
                                className="seller-dash-light__gig-card animate-fade-in-up"
                                style={{ animationDelay: `${index * 80}ms`, position: 'relative' }}
                            >
                                {/* edit/delete actions */}
                                <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '6px', zIndex: 10 }}>
                                    <button
                                        onClick={() => handleOpenEdit(gig)}
                                        style={{ padding: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: '1px solid #ddd', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        title="Edit gig"
                                    >
                                        <Edit3 size={16} color="#5b4fff" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(gig._id)}
                                        style={{ padding: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: '1px solid #ddd', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        title="Delete gig"
                                        disabled={deletingIds.includes(gig._id)}
                                    >
                                        <Trash2 size={16} color="#ef4444" />
                                    </button>
                                </div>
                                {/* Gig Image / Placeholder */}
                                <div className="seller-dash-light__gig-image">
                                    {gig.coverImage ? (
                                        <img
                                            src={assetUrl(gig.coverImage)}
                                            alt={gig.title}
                                        />
                                    ) : (
                                        <div className="seller-dash-light__gig-placeholder">
                                            <ImagePlus />
                                        </div>
                                    )}
                                    {/* Price badge */}
                                    <div className="seller-dash-light__gig-price">
                                        LKR {gigPrice.toLocaleString()}
                                    </div>
                                </div>

                                {/* Gig Info */}
                                <div className="seller-dash-light__gig-body">
                                    <div className="seller-dash-light__gig-category">
                                        <Tag />
                                        <span>{gig.category}</span>
                                    </div>
                                    <h3 className="seller-dash-light__gig-title">
                                        {gig.title}
                                    </h3>
                                    <div className="seller-dash-light__gig-delivery">
                                        <Clock />
                                        <span>{gigDelivery}</span>
                                    </div>
                                </div>
                            </div>;
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerDashboard;
