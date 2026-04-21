import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
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
    const { updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [buyerDashboard, setBuyerDashboard] = useState(null);
    const [error, setError] = useState('');
    const [confirmingOrderId, setConfirmingOrderId] = useState('');

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

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await apiClient.get('/api/portfolio/me');
                setProfile(data);
                updateUser({ ...data, token: localStorage.getItem('unigig_token') });
                if (!data.isStudentSeller) {
                    await loadBuyerDashboard();
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load profile. Please refresh and try again.');
            }
        };
        load();
    }, [loadBuyerDashboard, updateUser]);

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

                        <div className="buyer-quick-stats">
                            <div><strong>{postedJobStats.active}</strong><span>Active Jobs</span></div>
                            <div><strong>{postedJobStats.pending}</strong><span>Pending Jobs</span></div>
                            <div><strong>{postedJobStats.completed}</strong><span>Completed Jobs</span></div>
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
                    </div>
                </div>
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
                        <Link to="/profile/edit" className="btn-primary profile-edit-btn seller-edit-btn">
                            <PenSquare size={16} />
                            Edit Profile
                        </Link>
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
                </div>
            </div>
        </section>
    );
}

export default UserProfilePage;
