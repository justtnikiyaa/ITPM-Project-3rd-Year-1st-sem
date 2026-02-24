import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Plus,
    Upload,
    ImagePlus,
    X,
    Clock,
    Tag,
    Sparkles,
    LayoutDashboard,
    Zap,
    Moon,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SellerDashboard = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [gigs, setGigs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toggling, setToggling] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const dropzoneRef = useRef(null);

    // Redirect non-sellers
    useEffect(() => {
        if (user && !user.isStudentSeller) {
            navigate('/');
        }
    }, [user, navigate]);

    // Load seller's gigs
    useEffect(() => {
        const fetchGigs = async () => {
            try {
                const res = await axios.get('/api/services/my');
                setGigs(res.data);
            } catch (err) {
                console.error('Failed to load gigs:', err);
            } finally {
                setLoading(false);
            }
        };
        if (user?.isStudentSeller) fetchGigs();
    }, [user]);

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

    // Image handling
    const handleImageSelect = useCallback((file) => {
        if (file && file.type.startsWith('image/')) {
            setCoverImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleImageSelect(file);
    }, [handleImageSelect]);

    const removeImage = () => {
        setCoverImage(null);
        setImagePreview(null);
    };

    // Submit new gig
    const handleSubmitGig = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);
            formData.append('price', price);
            formData.append('deliveryTime', deliveryTime);
            if (coverImage) formData.append('coverImage', coverImage);

            const res = await axios.post('/api/services', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setGigs([res.data, ...gigs]);
            setSuccess('Gig posted successfully! 🎉');
            setTitle('');
            setDescription('');
            setCategory('');
            setPrice('');
            setDeliveryTime('');
            setCoverImage(null);
            setImagePreview(null);
            setShowForm(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create gig');
        } finally {
            setSubmitting(false);
        }
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
                            onClick={() => setShowForm(!showForm)}
                            className="seller-dash-light__new-btn"
                        >
                            <Plus />
                            Post a Gig
                        </button>
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

                {/* ═══ New Gig Form ═══ */}
                {showForm && (
                    <div className="seller-dash-light__form-card animate-fade-in-up">
                        <h2 className="seller-dash-light__form-title">
                            <Sparkles />
                            Create a New <span className="gradient-text">Gig</span>
                        </h2>
                        <form onSubmit={handleSubmitGig} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Title */}
                            <div className="md:col-span-2">
                                <label className="seller-dash-light__label">
                                    Gig Title
                                </label>
                                <input
                                    type="text"
                                    className="seller-dash-light__input"
                                    placeholder="I will design a stunning logo..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="seller-dash-light__label">
                                    Description
                                </label>
                                <textarea
                                    className="seller-dash-light__input"
                                    style={{ minHeight: '120px', resize: 'vertical' }}
                                    placeholder="Describe what you're offering in detail..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="seller-dash-light__label">
                                    Category
                                </label>
                                <select
                                    className="seller-dash-light__input"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                >
                                    <option value="">Select a category</option>
                                    <option value="Web Development">Web Development</option>
                                    <option value="Graphic Design">Graphic Design</option>
                                    <option value="Content Writing">Content Writing</option>
                                    <option value="Video Editing">Video Editing</option>
                                    <option value="Data Entry">Data Entry</option>
                                    <option value="Tutoring">Tutoring</option>
                                    <option value="Translation">Translation</option>
                                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                                    <option value="Mobile App Dev">Mobile App Dev</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Price */}
                            <div>
                                <label className="seller-dash-light__label">
                                    Price (LKR)
                                </label>
                                <input
                                    type="number"
                                    className="seller-dash-light__input"
                                    placeholder="5000"
                                    min="1"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Delivery Time */}
                            <div>
                                <label className="seller-dash-light__label">
                                    Delivery Time
                                </label>
                                <select
                                    className="seller-dash-light__input"
                                    value={deliveryTime}
                                    onChange={(e) => setDeliveryTime(e.target.value)}
                                    required
                                >
                                    <option value="">Select delivery time</option>
                                    <option value="1 Day">1 Day</option>
                                    <option value="2-3 Days">2-3 Days</option>
                                    <option value="3-5 Days">3-5 Days</option>
                                    <option value="1 Week">1 Week</option>
                                    <option value="2 Weeks">2 Weeks</option>
                                    <option value="1 Month">1 Month</option>
                                </select>
                            </div>

                            {/* ── Cover Image Dropzone ── */}
                            <div className="md:col-span-2">
                                <label className="seller-dash-light__label">
                                    Cover Image
                                </label>

                                {imagePreview ? (
                                    <div className="seller-dash-light__img-preview">
                                        <img
                                            src={imagePreview}
                                            alt="Cover preview"
                                        />
                                        <div className="seller-dash-light__img-overlay">
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="seller-dash-light__img-remove"
                                            >
                                                <X />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        ref={dropzoneRef}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => {
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.accept = 'image/*';
                                            input.onchange = (e) => handleImageSelect(e.target.files[0]);
                                            input.click();
                                        }}
                                        className={`dropzone-area ${isDragging ? 'dropzone-area--active' : ''}`}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '56px',
                                                height: '56px',
                                                borderRadius: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.3s ease',
                                                background: isDragging ? 'var(--color-primary)' : 'rgba(108, 99, 255, 0.08)',
                                                transform: isDragging ? 'scale(1.1)' : 'scale(1)',
                                            }}>
                                                {isDragging ? (
                                                    <Upload style={{ width: '24px', height: '24px', color: 'white' }} />
                                                ) : (
                                                    <ImagePlus style={{ width: '24px', height: '24px', color: 'var(--color-primary)' }} />
                                                )}
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <p className="text-sm" style={{ fontWeight: 600, color: '#444' }}>
                                                    {isDragging ? 'Drop your image here' : 'Drag & drop your cover image'}
                                                </p>
                                                <p className="text-xs" style={{ color: '#999', marginTop: '4px' }}>
                                                    or click to browse · PNG, JPG, WebP · Max 5MB
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="md:col-span-2" style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="seller-dash-light__submit-btn"
                                >
                                    {submitting ? (
                                        'Publishing...'
                                    ) : (
                                        <>
                                            <Sparkles />
                                            Publish Gig
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        removeImage();
                                    }}
                                    className="seller-dash-light__cancel-btn"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ═══ My Gigs Grid ═══ */}
                <div>
                    <h2 className="seller-dash-light__section-title">
                        My <span className="gradient-text">Gigs</span>
                        <span className="count">({gigs.length})</span>
                    </h2>

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
                                onClick={() => setShowForm(true)}
                                className="seller-dash-light__empty-btn"
                            >
                                <Plus />
                                Create Your First Gig
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {gigs.map((gig, index) => (
                                <div
                                    key={gig._id}
                                    className="seller-dash-light__gig-card animate-fade-in-up"
                                    style={{ animationDelay: `${index * 80}ms` }}
                                >
                                    {/* Gig Image / Placeholder */}
                                    <div className="seller-dash-light__gig-image">
                                        {gig.coverImage ? (
                                            <img
                                                src={`${API_BASE}${gig.coverImage}`}
                                                alt={gig.title}
                                            />
                                        ) : (
                                            <div className="seller-dash-light__gig-placeholder">
                                                <ImagePlus />
                                            </div>
                                        )}
                                        {/* Price badge */}
                                        <div className="seller-dash-light__gig-price gradient-text">
                                            LKR {gig.price?.toLocaleString()}
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
                                            <span>{gig.deliveryTime}</span>
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

export default SellerDashboard;
