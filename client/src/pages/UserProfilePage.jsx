import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import {
    Bell,
    Briefcase,
    CheckCircle2,
    Compass,
    FolderKanban,
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

function UserProfilePage() {
    const { updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [buyerDashboard, setBuyerDashboard] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await apiClient.get('/api/portfolio/me');
                setProfile(data);
                updateUser({ ...data, token: localStorage.getItem('unigig_token') });
                if (!data.isStudentSeller) {
                    try {
                        const dashboardRes = await apiClient.get('/api/portfolio/me/buyer-dashboard');
                        setBuyerDashboard(dashboardRes.data);
                    } catch {
                        // Do not fail the whole profile page if buyer extras fail.
                        setBuyerDashboard({
                            postedJobs: [],
                            postedJobStats: { active: 0, pending: 0, completed: 0 },
                            hiredFreelancers: [],
                            reviewsAboutBuyer: [],
                            notifications: [],
                        });
                    }
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load profile. Please refresh and try again.');
            }
        };
        load();
    }, [updateUser]);

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
                                        <div key={job.id} className="buyer-row">
                                            <span>{job.title}</span>
                                            <span className={`availability-badge ${job.status === 'Completed' ? 'active' : 'inactive'}`}>
                                                {job.status}
                                            </span>
                                        </div>
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
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default UserProfilePage;
