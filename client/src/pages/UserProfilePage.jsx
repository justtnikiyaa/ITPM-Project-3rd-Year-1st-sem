import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
    Trash2,
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
    Open: 'availability-badge buyer',
    Pending: 'availability-badge inactive',
    'In Progress': 'availability-badge active',
    Delivered: 'availability-badge buyer',
    Completed: 'availability-badge active',
    Cancelled: 'availability-badge inactive',
};

function UserProfilePage() {
    const { updateUser } = useAuth();
    const location = useLocation();
    const [profile, setProfile] = useState(null);
    const [buyerDashboard, setBuyerDashboard] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(location.state?.jobSuccessMessage || '');
    const [confirmingOrderId, setConfirmingOrderId] = useState('');
    const [jobStatusUpdatingId, setJobStatusUpdatingId] = useState('');
    const [deletingJobId, setDeletingJobId] = useState('');
    const [applicationUpdatingId, setApplicationUpdatingId] = useState('');

    const getFallbackBuyerDashboard = useCallback(
        () => ({
            postedJobs: [],
            placedOrders: [],
            postedJobStats: { active: 0, pending: 0, completed: 0 },
            hiredFreelancers: [],
            reviewsAboutBuyer: [],
            notifications: [],
        }),
        []
    );

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
            setSuccess('Delivery confirmed successfully.');
            await loadBuyerDashboard();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to confirm delivery. Please try again.');
        } finally {
            setConfirmingOrderId('');
        }
    }, [loadBuyerDashboard]);

    const handleUpdateJobStatus = useCallback(async (jobId, status) => {
        try {
            setJobStatusUpdatingId(jobId);
            setError('');
            await apiClient.patch(`/api/jobs/${jobId}/status`, { status });
            setSuccess('Job status updated successfully.');
            await loadBuyerDashboard();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update job status.');
        } finally {
            setJobStatusUpdatingId('');
        }
    }, [loadBuyerDashboard]);

    const handleDeleteJob = useCallback(async (jobId) => {
        if (!window.confirm('Delete this job post?')) return;

        try {
            setDeletingJobId(jobId);
            setError('');
            await apiClient.delete(`/api/jobs/${jobId}`);
            setSuccess('Job deleted successfully.');
            await loadBuyerDashboard();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete job.');
        } finally {
            setDeletingJobId('');
        }
    }, [loadBuyerDashboard]);

    const handleApplicationStatus = useCallback(async (applicationId, status) => {
        try {
            setApplicationUpdatingId(applicationId);
            setError('');
            await apiClient.patch(`/api/applications/${applicationId}/status`, { status });
            setSuccess(`Application ${status.toLowerCase()} successfully.`);
            await loadBuyerDashboard();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update application status.');
        } finally {
            setApplicationUpdatingId('');
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

    if (error && !profile) return <div className="profile-page-light"><div className="page-wrap"><p className="text-error">{error}</p></div></div>;
    if (!profile) return <div className="profile-page-light"><div className="page-wrap"><p>Loading profile...</p></div></div>;

    if (!profile.isStudentSeller) {
        const postedJobs = buyerDashboard?.postedJobs || [];
        const placedOrders = buyerDashboard?.placedOrders || [];
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

                        {success ? (
                            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
                                {success}
                            </div>
                        ) : null}
                        {error ? (
                            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
                                {error}
                            </div>
                        ) : null}

                        <div className="buyer-quick-stats">
                            <div><strong>{postedJobStats.active}</strong><span>Active Jobs</span></div>
                            <div><strong>{postedJobStats.pending}</strong><span>Open Jobs</span></div>
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
                                        <article key={job.id} className="rounded-2xl border border-[#ececff] bg-[#fafaff] p-4 space-y-4">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                <div>
                                                    <p className="text-sm font-bold text-[#2c2c44]">{job.title}</p>
                                                    <p className="text-xs text-[#6a6981] mt-1">Posted {formatDate(job.createdAt)}</p>
                                                </div>
                                                <span className={buyerStatusClasses[job.status] || 'availability-badge inactive'}>
                                                    {job.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                                <div className="rounded-xl border border-white bg-white px-3 py-3">
                                                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a88ad] mb-1">Category</p>
                                                    <p className="text-sm font-semibold text-[#2c2c44]">{job.category}</p>
                                                </div>
                                                <div className="rounded-xl border border-white bg-white px-3 py-3">
                                                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a88ad] mb-1">Budget</p>
                                                    <p className="text-sm font-semibold text-[#2c2c44]">LKR {Number(job.budget || 0).toLocaleString()}</p>
                                                </div>
                                                <div className="rounded-xl border border-white bg-white px-3 py-3">
                                                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a88ad] mb-1">Delivery Time</p>
                                                    <p className="text-sm font-semibold text-[#2c2c44] inline-flex items-center gap-2">
                                                        <Clock3 size={14} />
                                                        {job.deliveryTime} Days
                                                    </p>
                                                </div>
                                            </div>

                                            {job.skills?.length ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {job.skills.map((skill) => (
                                                        <span key={`${job.id}-${skill}`} className="portfolio-skill-pill">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : null}

                                            <div className="rounded-xl border border-[#ececff] bg-white px-4 py-3">
                                                <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a88ad] mb-2">Job Description</p>
                                                <p className="text-sm text-[#2c2c44] whitespace-pre-wrap">{job.description}</p>
                                            </div>

                                            {job.requirements ? (
                                                <div className="rounded-xl border border-[#ececff] bg-white px-4 py-3">
                                                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a88ad] mb-2">Additional Requirements</p>
                                                    <p className="text-sm text-[#2c2c44] whitespace-pre-wrap">{job.requirements}</p>
                                                </div>
                                            ) : null}

                                            <div className="rounded-xl border border-[#ececff] bg-white px-4 py-4">
                                                <div className="flex items-center justify-between gap-3 mb-3">
                                                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a88ad]">Applications</p>
                                                    <span className="text-xs font-semibold text-[#6a6981]">
                                                        {job.applications?.length || 0} received
                                                    </span>
                                                </div>

                                                {job.applications?.length ? (
                                                    <div className="buyer-list">
                                                        {job.applications.map((application) => (
                                                            <div key={application.id} className="rounded-2xl border border-[#ececff] bg-[#fafaff] p-4 space-y-3">
                                                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                                    <div>
                                                                        <p className="text-sm font-bold text-[#2c2c44]">
                                                                            {application.seller?.name || 'Seller'}
                                                                        </p>
                                                                        <p className="text-xs text-[#6a6981] mt-1">
                                                                            Applied {formatDate(application.createdAt)}
                                                                        </p>
                                                                    </div>
                                                                    <span className={buyerStatusClasses[application.status] || 'availability-badge inactive'}>
                                                                        {application.status}
                                                                    </span>
                                                                </div>

                                                                <p className="text-sm text-[#2c2c44] whitespace-pre-wrap">
                                                                    {application.message}
                                                                </p>

                                                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                                    <div className="rounded-xl border border-white bg-white px-3 py-3">
                                                                        <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a88ad] mb-1">Proposed Price</p>
                                                                        <p className="text-sm font-semibold text-[#2c2c44]">LKR {Number(application.proposedPrice || 0).toLocaleString()}</p>
                                                                    </div>
                                                                    <div className="rounded-xl border border-white bg-white px-3 py-3">
                                                                        <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a88ad] mb-1">Delivery Time</p>
                                                                        <p className="text-sm font-semibold text-[#2c2c44]">{application.deliveryTime} Days</p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-col sm:flex-row gap-3">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleApplicationStatus(application.id, 'Accepted')}
                                                                        disabled={applicationUpdatingId === application.id || application.status === 'Accepted'}
                                                                        className="btn-primary seller-edit-btn inline-flex items-center justify-center gap-2"
                                                                    >
                                                                        <CheckCircle2 size={16} />
                                                                        {applicationUpdatingId === application.id ? 'Saving...' : application.status === 'Accepted' ? 'Accepted' : 'Accept'}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleApplicationStatus(application.id, 'Rejected')}
                                                                        disabled={applicationUpdatingId === application.id || application.status === 'Rejected'}
                                                                        className="btn-secondary seller-edit-btn inline-flex items-center justify-center gap-2"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-[#6a6981]">No applications yet for this job.</p>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                <select
                                                    value={job.status}
                                                    onChange={(event) => handleUpdateJobStatus(job.id, event.target.value)}
                                                    disabled={jobStatusUpdatingId === job.id}
                                                    className="rounded-xl border border-[#d8d7f0] bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                                >
                                                    {['Open', 'In Progress', 'Completed', 'Cancelled'].map((status) => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteJob(job.id)}
                                                    disabled={deletingJobId === job.id}
                                                    className="btn-secondary seller-edit-btn inline-flex items-center justify-center gap-2"
                                                >
                                                    <Trash2 size={16} />
                                                    {deletingJobId === job.id ? 'Deleting...' : 'Delete Job'}
                                                </button>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p>No job listings yet. Start by posting your first job.</p>
                            )}
                        </div>

                        <div className="profile-section buyer-wide-card">
                            <h4><ImageIcon size={16} />Placed Orders</h4>
                            {placedOrders.length ? (
                                <div className="buyer-list">
                                    {placedOrders.slice(0, 4).map((order) => (
                                        <article key={order.id} className="rounded-2xl border border-[#ececff] bg-[#fafaff] p-4 space-y-4">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                <div>
                                                    <p className="text-sm font-bold text-[#2c2c44]">{order.title}</p>
                                                    <p className="text-xs text-[#6a6981] mt-1">Ordered {formatDate(order.orderDate || order.createdAt)}</p>
                                                </div>
                                                <span className={buyerStatusClasses[order.status] || 'availability-badge inactive'}>
                                                    {order.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                                <div className="rounded-xl border border-white bg-white px-3 py-3">
                                                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a88ad] mb-1">Package</p>
                                                    <p className="text-sm font-semibold text-[#2c2c44]">{order.packageName}</p>
                                                </div>
                                                <div className="rounded-xl border border-white bg-white px-3 py-3">
                                                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a88ad] mb-1">Price</p>
                                                    <p className="text-sm font-semibold text-[#2c2c44]">LKR {Number(order.price || 0).toLocaleString()}</p>
                                                </div>
                                                <div className="rounded-xl border border-white bg-white px-3 py-3">
                                                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a88ad] mb-1">Delivery Time</p>
                                                    <p className="text-sm font-semibold text-[#2c2c44] inline-flex items-center gap-2">
                                                        <Clock3 size={14} />
                                                        {order.deliveryTime}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="rounded-xl border border-[#ececff] bg-white px-4 py-3">
                                                <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a88ad] mb-2">Your Requirements</p>
                                                <p className="text-sm text-[#2c2c44] whitespace-pre-wrap">
                                                    {order.requirementsMessage || 'No additional requirements were provided.'}
                                                </p>
                                            </div>

                                            {(order.status === 'Delivered' || order.status === 'Completed') && (
                                                <div className="rounded-xl border border-[#dedbff] bg-[#f6f4ff] px-4 py-4 space-y-4">
                                                    <div className="flex items-center gap-2 text-[#4a3fb9]">
                                                        <ImageIcon size={16} />
                                                        <p className="text-sm font-bold">Seller Delivery</p>
                                                    </div>

                                                    {order.deliveredImage ? (
                                                        <img
                                                            src={toImageUrl(order.deliveredImage)}
                                                            alt={`${order.title} delivery preview`}
                                                            className="w-full max-h-[240px] rounded-xl object-cover border border-white"
                                                        />
                                                    ) : null}

                                                    <div>
                                                        <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a88ad] mb-2">Delivery Note</p>
                                                        <p className="text-sm text-[#2c2c44] whitespace-pre-wrap">
                                                            {order.deliveryNote || 'No delivery note was added for this order.'}
                                                        </p>
                                                    </div>

                                                    <p className="text-xs text-[#6a6981]">Delivered on {formatDate(order.deliveredAt)}</p>

                                                    {order.status === 'Delivered' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleConfirmDelivery(order.id)}
                                                            disabled={confirmingOrderId === order.id}
                                                            className="btn-primary seller-edit-btn"
                                                        >
                                                            <CheckCircle2 size={16} />
                                                            {confirmingOrderId === order.id ? 'Confirming...' : 'Confirm Delivery'}
                                                        </button>
                                                    ) : (
                                                        <p className="text-sm font-semibold text-[#17824c]">You already confirmed this delivery.</p>
                                                    )}
                                                </div>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p>No service orders yet.</p>
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
                                        <span className={`availability-badge ${(profile.availability || 'Active') === 'Active' ? 'active' : 'inactive'}`}>
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
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default UserProfilePage;
