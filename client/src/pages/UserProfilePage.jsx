import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../components/portfolio/StarRating';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import AddReviewForm from '../components/portfolio/AddReviewForm';
import ConfirmationModal from '../components/portfolio/ConfirmationModal';
import {
    Bell,
    Briefcase,
    CheckCircle2,
    Compass,
    Clock3,
    FolderKanban,
    ImageIcon,
    Mail,
    PenSquare,
    Sparkles,
    UserCheck,
    Users2,
    Wallet,
    Wrench,
    CheckCircle,
    MessageSquare,
    Star,
    LayoutDashboard,
    Trash2,
    Edit3,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const toImageUrl = (path) => (path?.startsWith('http') ? path : `${API_BASE}${path || ''}`);
const formatDate = (value) =>
    value
        ? new Date(value).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : 'N/A';
const buyerStatusClasses = {
    Pending: 'availability-badge inactive',
    'In Progress': 'availability-badge active',
    Delivered: 'availability-badge buyer',
    Completed: 'availability-badge active',
    Cancelled: 'availability-badge inactive',
};

function UserProfilePage() {
    const { updateUser, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [buyerDashboard, setBuyerDashboard] = useState(null);
    const [error, setError] = useState('');
    const [confirmingOrderId, setConfirmingOrderId] = useState('');
    const [reviewingOrderId, setReviewingOrderId] = useState('');
    const [showGeneralReviewForm, setShowGeneralReviewForm] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState('');
    const [editForm, setEditForm] = useState({ rating: 5, comment: '' });
    const [busyReviewId, setBusyReviewId] = useState('');
    const [myReviews, setMyReviews] = useState([]);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, reviewId: null });
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

    const getFallbackBuyerDashboard = useCallback(() => ({
        postedJobs: [],
        postedJobStats: { active: 0, pending: 0, completed: 0 },
        hiredFreelancers: [],
        reviewsAboutBuyer: [],
        notifications: [],
    }), []);

    const loadBuyerDashboard = useCallback(async () => {
        try {
            const dashboardRes = await apiClient.get('/api/portfolio/me/buyer-dashboard');
            setBuyerDashboard(dashboardRes.data);
        } catch {
            setBuyerDashboard(getFallbackBuyerDashboard());
        }
    }, [getFallbackBuyerDashboard]);

    const handleConfirmDelivery = useCallback(async (orderId) => {
        try {
            setConfirmingOrderId(orderId);
            setError('');
            await apiClient.patch(`/api/orders/${orderId}/confirm`);
            await loadBuyerDashboard();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to confirm delivery. Please try again.');
        } finally {
            setConfirmingOrderId('');
        }
    }, [loadBuyerDashboard]);

    const loadMyReviews = useCallback(async () => {
        try {
            const reviewsRes = await apiClient.get('/api/reviews/me');
            setMyReviews(reviewsRes.data);
        } catch (e) {
            console.error('Failed to load my reviews', e);
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await apiClient.get('/api/portfolio/me');
                setProfile(data);
                updateUser({ ...data, token: localStorage.getItem('unigig_token') });
                if (!data.isStudentSeller) {
                    await loadBuyerDashboard();
                    await loadMyReviews();
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load profile. Please refresh and try again.');
            }
        };
        load();
    }, [loadBuyerDashboard, updateUser, loadMyReviews]);

    const handleUpdateMyReview = async (reviewId) => {
        try {
            setBusyReviewId(reviewId);
            await apiClient.patch(`/api/reviews/${reviewId}`, editForm);
            setEditingReviewId('');
            await loadMyReviews();
            await loadBuyerDashboard();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update review');
        } finally {
            setBusyReviewId('');
        }
    };

    const handleDeleteMyReview = async () => {
        const reviewId = confirmModal.reviewId;
        if (!reviewId) return;
        
        try {
            setBusyReviewId(reviewId);
            setConfirmModal({ isOpen: false, reviewId: null });
            await apiClient.delete(`/api/reviews/${reviewId}`);
            await loadMyReviews();
            await loadBuyerDashboard();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete review');
        } finally {
            setBusyReviewId('');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await apiClient.delete('/api/users/me');
            logout();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete account');
        }
    };

    if (error) return <div className="profile-page-light"><div className="page-wrap"><p className="text-error">{error}</p></div></div>;
    if (!profile) return <div className="profile-page-light"><div className="page-wrap"><p>Loading profile...</p></div></div>;

    if (!profile.isStudentSeller) {
        const postedJobs = buyerDashboard?.postedJobs || [];
        const hiredFreelancers = buyerDashboard?.hiredFreelancers || [];
        const notifications = buyerDashboard?.notifications || [];
        const reviewsAboutBuyer = buyerDashboard?.reviewsAboutBuyer || [];
        const postedJobStats = buyerDashboard?.postedJobStats || {
            active: 0,
            pending: 0,
            completed: 0,
        };

        return (
            <section className="profile-page-light">
                <div className="page-wrap">
                    <div className="seller-dashboard-card">
                        <div className="seller-dashboard-header">
                            <div className="seller-dashboard-top">
                                {profile.profileImage ? (
                                    <img src={toImageUrl(profile.profileImage)} alt={profile.name} className="profile-avatar-xl" />
                                ) : (
                                    <div className="profile-avatar-fallback">{profile.name?.charAt(0).toUpperCase()}</div>
                                )}
                                <div className="seller-dashboard-id">
                                    <h2 className="profile-name">{profile.name}</h2>
                                    <p className="profile-email">
                                        <Mail size={15} />
                                        {profile.email}
                                    </p>
                                    <div className="seller-role-row">
                                        <span className="profile-role-badge buyer">Buyer</span>
                                        <span className="availability-badge active">
                                            <UserCheck size={14} />
                                            Hiring Ready
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="buyer-action-group">
                                <Link to="/jobs/create" className="btn-primary seller-edit-btn">
                                    <FolderKanban size={16} />
                                    Post a Job
                                </Link>
                                <Link to="/profile/edit" className="btn-secondary seller-edit-btn">
                                    <PenSquare size={16} />
                                    Edit Profile
                                </Link>
                            </div>
                        </div>

                        <p className="profile-bio">
                            {profile.bio ||
                                'I hire reliable freelancers for quality student-focused projects in design, tech, and content.'}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                            <div className="glass-card p-6 border-none shadow-md flex flex-col items-center text-center group hover:bg-[#4a3fb9] transition-all duration-300">
                                <div className="p-3 bg-[#f0f0ff] text-[#4a3fb9] rounded-2xl mb-3 group-hover:bg-white/20 group-hover:text-white transition-colors">
                                    <FolderKanban size={24} />
                                </div>
                                <strong className="text-2xl font-black group-hover:text-white">{postedJobStats.active}</strong>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white/70">Active Jobs</span>
                            </div>
                            <div className="glass-card p-6 border-none shadow-md flex flex-col items-center text-center group hover:bg-[#4a3fb9] transition-all duration-300">
                                <div className="p-3 bg-[#fff9e6] text-[#ffb800] rounded-2xl mb-3 group-hover:bg-white/20 group-hover:text-white transition-colors">
                                    <Clock3 size={24} />
                                </div>
                                <strong className="text-2xl font-black group-hover:text-white">{postedJobStats.pending}</strong>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white/70">Pending Jobs</span>
                            </div>
                            <div className="glass-card p-6 border-none shadow-md flex flex-col items-center text-center group hover:bg-[#4a3fb9] transition-all duration-300">
                                <div className="p-3 bg-[#e5fcf4] text-[#00b88a] rounded-2xl mb-3 group-hover:bg-white/20 group-hover:text-white transition-colors">
                                    <CheckCircle size={24} />
                                </div>
                                <strong className="text-2xl font-black group-hover:text-white">{postedJobStats.completed}</strong>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white/70">Completed Jobs</span>
                            </div>
                            <div className="glass-card p-6 border-none shadow-md flex flex-col items-center text-center group hover:bg-[#4a3fb9] transition-all duration-300">
                                <div className="p-3 bg-[#fff0f0] text-[#ff6b6b] rounded-2xl mb-3 group-hover:bg-white/20 group-hover:text-white transition-colors">
                                    <MessageSquare size={24} />
                                </div>
                                <strong className="text-2xl font-black group-hover:text-white">{myReviews.length}</strong>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white/70">Reviews Given</span>
                            </div>
                        </div>

                        <div className="seller-sections-grid">
                            <div className="profile-section">
                                <h4><Compass size={16} />Hiring Interests</h4>
                                <p>{profile.skills?.length ? profile.skills.join(', ') : 'Web development, graphic design, writing'}</p>
                            </div>
                            <div className="profile-section">
                                <h4><Wallet size={16} />Budget Preference</h4>
                                <p>{profile.budgetPreference || 'Flexible budget based on project scope and quality.'}</p>
                            </div>
                            <div className="profile-section">
                                <h4><Bell size={16} />Notifications</h4>
                                {notifications.length ? (
                                    <ul className="buyer-list">
                                        {notifications.slice(0, 3).map((note) => (
                                            <li key={note.message}>{note.message}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No new notifications.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="seller-sections-grid">
                        <div className="profile-section buyer-wide-card">
                            <h4><FolderKanban size={16} />Posted Jobs</h4>
                            {postedJobs.length ? (
                                <div className="buyer-list">
                                    {postedJobs.slice(0, 5).map((job) => (
                                        <article
                                            key={job.id}
                                            className="rounded-2xl border border-[#ececff] bg-[#fafaff] p-4 space-y-4"
                                        >
                                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                <div>
                                                    <p className="text-sm font-bold text-[#2c2c44]">{job.title}</p>
                                                    <p className="text-xs text-[#6a6981] mt-1">
                                                        Ordered {formatDate(job.orderDate || job.createdAt)}
                                                    </p>
                                                </div>
                                                <span className={buyerStatusClasses[job.status] || 'availability-badge inactive'}>
                                                    {job.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                                <div className="rounded-xl border border-white bg-white px-3 py-3">
                                                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a88ad] mb-1">Package</p>
                                                    <p className="text-sm font-semibold text-[#2c2c44]">{job.packageName}</p>
                                                </div>
                                                <div className="rounded-xl border border-white bg-white px-3 py-3">
                                                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a88ad] mb-1">Price</p>
                                                    <p className="text-sm font-semibold text-[#2c2c44]">LKR {Number(job.price || 0).toLocaleString()}</p>
                                                </div>
                                                <div className="rounded-xl border border-white bg-white px-3 py-3">
                                                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a88ad] mb-1">Delivery Time</p>
                                                    <p className="text-sm font-semibold text-[#2c2c44] inline-flex items-center gap-2">
                                                        <Clock3 size={14} />
                                                        {job.deliveryTime}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="rounded-xl border border-[#ececff] bg-white px-4 py-3">
                                                <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a88ad] mb-2">
                                                    Your Requirements
                                                </p>
                                                <p className="text-sm text-[#2c2c44] whitespace-pre-wrap">
                                                    {job.requirementsMessage || 'No additional requirements were provided.'}
                                                </p>
                                            </div>

                                            {(job.status === 'Delivered' || job.status === 'Completed') && (
                                                <div className="rounded-xl border border-[#dedbff] bg-[#f6f4ff] px-4 py-4 space-y-4">
                                                    <div className="flex items-center gap-2 text-[#4a3fb9]">
                                                        <ImageIcon size={16} />
                                                        <p className="text-sm font-bold">Seller Delivery</p>
                                                    </div>

                                                    {job.deliveredImage ? (
                                                        <img
                                                            src={toImageUrl(job.deliveredImage)}
                                                            alt={`${job.title} delivery preview`}
                                                            className="w-full max-h-[240px] rounded-xl object-cover border border-white"
                                                        />
                                                    ) : null}

                                                    <div>
                                                        <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a88ad] mb-2">
                                                            Delivery Note
                                                        </p>
                                                        <p className="text-sm text-[#2c2c44] whitespace-pre-wrap">
                                                            {job.deliveryNote || 'No delivery note was added for this order.'}
                                                        </p>
                                                    </div>

                                                    <p className="text-xs text-[#6a6981]">
                                                        Delivered on {formatDate(job.deliveredAt)}
                                                    </p>

                                                    {job.status === 'Delivered' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleConfirmDelivery(job.id)}
                                                            disabled={confirmingOrderId === job.id}
                                                            className="btn-primary seller-edit-btn"
                                                        >
                                                            <CheckCircle2 size={16} />
                                                            {confirmingOrderId === job.id ? 'Confirming...' : 'Confirm Delivery'}
                                                        </button>
                                                    ) : (
                                                        <p className="text-sm font-semibold text-[#17824c]">
                                                            You already confirmed this delivery.
                                                        </p>
                                                    )}

                                                    {job.status === 'Completed' && !myReviews.some(r => String(r.order) === String(job.id)) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setReviewingOrderId(job.id)}
                                                            className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
                                                        >
                                                            <Star size={14} /> Submit Review
                                                        </button>
                                                    )}

                                                    {reviewingOrderId === job.id && (
                                                        <div className="animate-fade-in mt-6 pt-6 border-t border-[#dedbff]">
                                                            <AddReviewForm 
                                                                preselectedOrderId={job.id} 
                                                                onSuccess={() => {
                                                                    setReviewingOrderId('');
                                                                    loadBuyerDashboard();
                                                                    apiClient.get('/api/reviews/me').then(res => setMyReviews(res.data));
                                                                }} 
                                                            />
                                                            <button 
                                                                onClick={() => setReviewingOrderId('')}
                                                                className="mt-4 text-xs font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest block mx-auto"
                                                            >
                                                                Cancel Review
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p>No job listings yet. Start by posting your first job.</p>
                            )}
                        </div>

                        <div className="profile-section buyer-wide-card">
                            <h4><Users2 size={16} />Hired Freelancers & Collaborations</h4>
                            {hiredFreelancers.length ? (
                                <div className="buyer-list">
                                    {hiredFreelancers.slice(0, 5).map((freelancer) => (
                                        <div key={freelancer.id} className="buyer-row">
                                            <span>{freelancer.name}</span>
                                            <span>{freelancer.collaborations} collaboration(s)</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No collaborations yet.</p>
                            )}
                        </div>

                        <div className="profile-section buyer-wide-card">
                            <h4><CheckCircle2 size={16} />Reviews & Ratings from Freelancers</h4>
                            {reviewsAboutBuyer.length ? (
                                <div className="buyer-list">
                                    {reviewsAboutBuyer.map((review) => (
                                        <div key={review._id} className="buyer-row">
                                            <span>{review.comment}</span>
                                            <span>{review.rating}/5</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No freelancer reviews yet.</p>
                            )}
                        </div>

                        <div className="profile-section buyer-wide-card border-none bg-transparent p-0">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-xl font-black text-[#1a1a2e] flex items-center gap-2"><MessageSquare size={20} className="text-[#4a3fb9]" />My Submitted Reviews</h4>
                                <div className="h-0.5 flex-1 mx-6 bg-gray-100 rounded-full"></div>
                                <button 
                                    onClick={() => setShowGeneralReviewForm(!showGeneralReviewForm)}
                                    className="px-4 py-2 bg-[#4a3fb9] text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:shadow-lg transition-all"
                                >
                                    {showGeneralReviewForm ? 'Cancel Review' : 'Submit Review by ID'}
                                </button>
                            </div>

                            {showGeneralReviewForm && (
                                <div className="mb-10 max-w-2xl mx-auto">
                                    <AddReviewForm 
                                        onSuccess={() => {
                                            setShowGeneralReviewForm(false);
                                            loadBuyerDashboard();
                                            apiClient.get('/api/reviews/me').then(res => setMyReviews(res.data));
                                        }}
                                    />
                                </div>
                            )}
                            {myReviews.length ? (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {myReviews.map((review) => (
                                        <div key={review._id} className="glass-card p-6 border-none shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <span className="text-[10px] font-black text-[#4a3fb9] uppercase tracking-widest">Feedback for</span>
                                                    <h5 className="text-sm font-black text-[#1a1a2e]">{review.sellerName}</h5>
                                                </div>
                                                <StarRating rating={review.rating} readOnly size={12} />
                                            </div>
                                            {editingReviewId === review._id ? (
                                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Edit Rating</label>
                                                        <StarRating rating={editForm.rating} setRating={(val) => setEditForm({ ...editForm, rating: val })} size={20} />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Edit Comment</label>
                                                        <textarea 
                                                            className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4a3fb9]"
                                                            value={editForm.comment}
                                                            onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                                                            rows={3}
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleUpdateMyReview(review._id)}
                                                            disabled={busyReviewId === review._id}
                                                            className="flex-1 py-2 bg-[#4a3fb9] text-white text-[10px] font-black uppercase rounded-lg disabled:opacity-50"
                                                        >
                                                            {busyReviewId === review._id ? 'Saving...' : 'Save Changes'}
                                                        </button>
                                                        <button 
                                                            onClick={() => setEditingReviewId('')}
                                                            className="flex-1 py-2 bg-gray-200 text-gray-600 text-[10px] font-black uppercase rounded-lg"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-xs text-gray-600 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl italic border border-gray-100">"{review.comment}"</p>
                                                    <div className="mt-4 flex items-center justify-between">
                                                        <div className="flex gap-4">
                                                            <button 
                                                                onClick={() => {
                                                                    setEditingReviewId(review._id);
                                                                    setEditForm({ rating: review.rating, comment: review.comment });
                                                                }}
                                                                className="flex items-center gap-1 text-[10px] font-black uppercase text-[#4a3fb9] hover:opacity-70"
                                                            >
                                                                <Edit3 size={12} /> Edit
                                                            </button>
                                                            <button 
                                                                onClick={() => setConfirmModal({ isOpen: true, reviewId: review._id })}
                                                                disabled={busyReviewId === review._id}
                                                                className="flex items-center gap-1 text-[10px] font-black uppercase text-red-500 hover:opacity-70 disabled:opacity-50"
                                                            >
                                                                <Trash2 size={12} /> Delete
                                                            </button>
                                                        </div>
                                                        <Link to={`/portfolio/${review.sellerId}`} className="text-[10px] font-black uppercase text-gray-400 hover:text-[#4a3fb9]">View Seller</Link>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="glass-card p-12 text-center border-dashed border-2 border-gray-200">
                                    <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
                                    <p className="text-gray-400 font-bold">You haven't submitted any reviews yet.</p>
                                    <Link to="/" className="mt-4 inline-block text-sm font-black text-[#4a3fb9] hover:underline">Browse services to get started</Link>
                                </div>
                            )}
                        </div>

                        <ConfirmationModal 
                            isOpen={confirmModal.isOpen}
                            title="Delete Review?"
                            message="This action cannot be undone. Your feedback will be permanently removed from the student seller's portfolio."
                            confirmText="Delete Permanently"
                            cancelText="Keep Review"
                            onConfirm={handleDeleteMyReview}
                            onCancel={() => setConfirmModal({ isOpen: false, reviewId: null })}
                        />

                        <div className="profile-section buyer-wide-card">
                            <h4><Briefcase size={16} />Find Freelancers / Hire Now</h4>
                            <div className="portfolio-skills-wrap">
                                {['Web Development', 'Graphic Design', 'Writing', 'Mobile Apps'].map((category) => (
                                    <Link key={category} to={`/?category=${encodeURIComponent(category)}`} className="portfolio-skill-pill">
                                        {category}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-red-100">
                            <div className="bg-red-50 p-8 rounded-3xl border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h4 className="text-lg font-black text-red-500 mb-2">Danger Zone</h4>
                                    <p className="text-sm text-red-500/70 font-bold leading-relaxed">Once you delete your account, there is no going back. All your data will be permanently removed.</p>
                                </div>
                                <button 
                                    onClick={() => setShowDeleteAccountModal(true)}
                                    className="px-8 py-3 bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:bg-red-600 transition-all"
                                >
                                    Delete My Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <ConfirmationModal 
                    isOpen={showDeleteAccountModal}
                    title="Delete Account Permanently?"
                    message="This will delete your profile, services, and reviews. This action is irreversible. Are you absolutely sure?"
                    confirmText="Yes, Delete Everything"
                    cancelText="No, Keep My Account"
                    onConfirm={handleDeleteAccount}
                    onCancel={() => setShowDeleteAccountModal(false)}
                />
            </section>
        );
    }

    return (
        <section className="profile-page-light">
            <div className="page-wrap">
                <div className="seller-dashboard-card">
                    <div className="seller-dashboard-header">
                        <div className="seller-dashboard-top">
                            {profile.profileImage ? (
                                <img src={toImageUrl(profile.profileImage)} alt={profile.name} className="profile-avatar-xl" />
                            ) : (
                                <div className="profile-avatar-fallback">{profile.name?.charAt(0).toUpperCase()}</div>
                            )}
                            <div className="seller-dashboard-id">
                                <h2 className="profile-name">{profile.name}</h2>
                                <p className="profile-email">
                                    <Mail size={15} />
                                    {profile.email}
                                </p>
                                <div className="seller-role-row">
                                    <span className={`profile-role-badge ${profile.isStudentSeller ? 'seller' : 'buyer'}`}>
                                        {profile.isStudentSeller ? 'Seller' : 'Buyer'}
                                    </span>
                                    {profile.isStudentSeller ? (
                                        <span
                                            className={`availability-badge ${(profile.availability || 'Active') === 'Active' ? 'active' : 'inactive'
                                                }`}
                                        >
                                            <UserCheck size={14} />
                                            {(profile.availability || 'Active') === 'Active' ? 'Active' : 'Inactive'}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Link to={`/portfolio/${profile._id}`} className="btn-secondary profile-edit-btn seller-edit-btn">
                                <Compass size={16} />
                                View Portfolio
                            </Link>
                            <Link to="/profile/edit" className="btn-primary profile-edit-btn seller-edit-btn">
                                <PenSquare size={16} />
                                Edit Profile
                            </Link>
                        </div>
                    </div>

                    <p className="profile-bio">{profile.bio || 'Add a bio to make your profile more attractive to other users.'}</p>

                    <div className="seller-sections-grid">
                        <div className="profile-section">
                            <h4>
                                <Wrench size={16} />
                                Skills
                            </h4>
                            <p>{profile.skills?.length ? profile.skills.join(', ') : 'No skills added yet.'}</p>
                        </div>
                        {profile.isStudentSeller ? (
                            <>
                                <div className="profile-section">
                                    <h4>
                                        <Briefcase size={16} />
                                        Portfolio Summary
                                    </h4>
                                    <p>{profile.portfolioSummary || 'Add a short portfolio summary to highlight your strengths.'}</p>
                                </div>
                                <div className="profile-section">
                                    <h4>
                                        <Sparkles size={16} />
                                        Availability
                                    </h4>
                                    <p>{(profile.availability || 'Active') === 'Active' ? 'Available for new projects' : 'Currently inactive'}</p>
                                </div>
                                <div className="profile-section">
                                    <h4>
                                        <Briefcase size={16} />
                                        Work Experience / History
                                    </h4>
                                    <p>{profile.workExperience || 'Add your previous jobs, clients, and durations.'}</p>
                                </div>
                                <div className="profile-section">
                                    <h4>
                                        <Compass size={16} />
                                        Education & Certifications
                                    </h4>
                                    <p>{profile.educationCertifications || 'Add your degree details and certifications.'}</p>
                                </div>
                                <div className="profile-section">
                                    <h4>
                                        <Users2 size={16} />
                                        Social Links
                                    </h4>
                                    <p>
                                        LinkedIn: {profile.linkedinUrl || 'Not added'}
                                        <br />
                                        GitHub: {profile.githubUrl || 'Not added'}
                                        <br />
                                        Portfolio: {profile.portfolioWebsite || 'Not added'}
                                    </p>
                                </div>
                            </>
                        ) : null}
                    </div>
                    <div className="mt-12 pt-8 border-t border-red-100">
                        <div className="bg-red-50 p-8 rounded-3xl border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h4 className="text-lg font-black text-red-500 mb-2">Danger Zone</h4>
                                <p className="text-sm text-red-500/70 font-bold leading-relaxed">Once you delete your account, there is no going back. All your data will be permanently removed.</p>
                            </div>
                            <button 
                                onClick={() => setShowDeleteAccountModal(true)}
                                className="px-8 py-3 bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:bg-red-600 transition-all"
                            >
                                Delete My Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal 
                isOpen={showDeleteAccountModal}
                title="Delete Account Permanently?"
                message="This will delete your profile, services, and reviews. This action is irreversible. Are you absolutely sure?"
                confirmText="Yes, Delete Everything"
                cancelText="No, Keep My Account"
                onConfirm={handleDeleteAccount}
                onCancel={() => setShowDeleteAccountModal(false)}
            />
        </section>
    );
}

export default UserProfilePage;
