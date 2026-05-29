import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ChevronRight, Mail, Search, Sparkles, X } from 'lucide-react';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : 'N/A';

function JobsPage() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedJob, setSelectedJob] = useState(null);
    const [submittingApplication, setSubmittingApplication] = useState(false);
    const [applicationForm, setApplicationForm] = useState({
        message: '',
        proposedPrice: '',
        deliveryTime: '',
    });

    useEffect(() => {
        const loadJobs = async () => {
            try {
                setLoading(true);
                setError('');
                const query = selectedCategory !== 'All' ? `?category=${encodeURIComponent(selectedCategory)}` : '';
                const { data } = await apiClient.get(`/api/jobs${query}`);
                setJobs(data);
                if (selectedCategory === 'All') {
                    const uniqueCategories = Array.from(new Set(data.map((job) => job.category).filter(Boolean)));
                    setAllCategories(uniqueCategories);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load open jobs.');
            } finally {
                setLoading(false);
            }
        };

        loadJobs();
    }, [selectedCategory]);

    useEffect(() => {
        const loadApplications = async () => {
            if (!user?.isStudentSeller) return;

            try {
                const { data } = await apiClient.get('/api/applications/seller');
                setApplications(data);
            } catch (err) {
                console.error('Failed to load seller applications:', err);
            }
        };

        loadApplications();
    }, [user]);

    const categories = useMemo(() => ['All', ...allCategories], [allCategories]);
    const appliedJobIds = useMemo(
        () => new Set(applications.map((application) => String(application.job?._id || application.job))),
        [applications]
    );

    if (!user) return null;

    const handleOpenApply = (job) => {
        setSelectedJob(job);
        setApplicationForm({
            message: '',
            proposedPrice: String(job.budget || ''),
            deliveryTime: String(job.deliveryTime || ''),
        });
        setError('');
    };

    const handleCloseApply = () => {
        setSelectedJob(null);
        setApplicationForm({
            message: '',
            proposedPrice: '',
            deliveryTime: '',
        });
    };

    const handleApplicationChange = (field) => (event) => {
        setApplicationForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleSubmitApplication = async (event) => {
        event.preventDefault();

        if (!selectedJob) return;

        if (!applicationForm.message.trim()) {
            setError('Proposal message is required.');
            return;
        }
        if (!Number.isFinite(Number(applicationForm.proposedPrice)) || Number(applicationForm.proposedPrice) <= 0) {
            setError('Proposed price must be a positive number.');
            return;
        }
        if (!Number.isFinite(Number(applicationForm.deliveryTime)) || Number(applicationForm.deliveryTime) <= 0) {
            setError('Delivery time must be at least 1 day.');
            return;
        }

        try {
            setSubmittingApplication(true);
            setError('');
            const { data } = await apiClient.post('/api/applications', {
                jobId: selectedJob._id,
                message: applicationForm.message.trim(),
                proposedPrice: Number(applicationForm.proposedPrice),
                deliveryTime: Number(applicationForm.deliveryTime),
            });
            setApplications((prev) => [data.application, ...prev]);
            setSuccess('Application submitted successfully.');
            handleCloseApply();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit application.');
        } finally {
            setSubmittingApplication(false);
        }
    };

    return (
        <section className="home-page-light min-h-screen pt-24 pb-20">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-6 mt-4">
                    <Link to="/" className="hover:text-gray-600 transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                    <span className="text-gray-800 font-bold">Open Jobs</span>
                </div>

                <div className="glass-card rounded-[32px] p-8 mb-8 shadow-[0_18px_40px_rgba(80,70,170,0.08)]">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-400 mb-2">Job Marketplace</p>
                            <h1 className="text-3xl font-black text-slate-900">Open buyer requests</h1>
                            <p className="text-sm text-slate-500 mt-3 max-w-2xl">
                                Browse active job posts from buyers and reach out when your skills match their brief.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 inline-flex items-center gap-3 min-w-[220px]">
                                <Search size={16} className="text-slate-400" />
                                <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="bg-transparent outline-none w-full">
                                    {categories.map((category) => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            {!user.isStudentSeller ? (
                                <Link to="/jobs/create" className="btn-primary seller-edit-btn inline-flex items-center gap-2 justify-center">
                                    <Sparkles size={16} />
                                    Post a Job
                                </Link>
                            ) : null}
                        </div>
                    </div>
                </div>

                {error ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 mb-6">
                        {error}
                    </div>
                ) : null}
                {success ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700 mb-6">
                        {success}
                    </div>
                ) : null}

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="glass-card rounded-[32px] p-12 text-center">
                        <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                            <Briefcase />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-3">No open jobs yet</h2>
                        <p className="text-slate-500 max-w-xl mx-auto leading-7">
                            When buyers publish new job requests, they’ll appear here for sellers to browse and contact.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {jobs.map((job) => (
                            <article key={job._id} className="rounded-[28px] border border-white/70 bg-white/90 backdrop-blur p-7 shadow-[0_18px_40px_rgba(80,70,170,0.08)]">
                                <div className="flex items-start justify-between gap-4 mb-5">
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 mb-2">
                                            {job.category}
                                        </p>
                                        <h2 className="text-xl font-black text-slate-900 leading-tight">{job.title}</h2>
                                    </div>
                                    <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                                        {job.status}
                                    </span>
                                </div>

                                <p className="text-sm leading-7 text-slate-600 mb-5">{job.description}</p>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1">Budget</p>
                                        <p className="text-base font-black text-slate-900">LKR {Number(job.budget || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1">Delivery</p>
                                        <p className="text-base font-black text-slate-900">{job.deliveryTime} Days</p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1">Posted</p>
                                        <p className="text-base font-black text-slate-900">{formatDate(job.createdAt)}</p>
                                    </div>
                                </div>

                                {job.skills?.length ? (
                                    <div className="flex flex-wrap gap-2 mb-5">
                                        {job.skills.map((skill) => (
                                            <span key={`${job._id}-${skill}`} className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}

                                {job.requirements ? (
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 mb-6">
                                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">Additional Requirements</p>
                                        <p className="text-sm text-slate-600 leading-7">{job.requirements}</p>
                                    </div>
                                ) : null}

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{job.buyer?.name || 'Buyer'}</p>
                                        <p className="text-sm text-slate-500">Reach out if your portfolio fits this request.</p>
                                    </div>
                                    {user.isStudentSeller ? (
                                        appliedJobIds.has(String(job._id)) ? (
                                            <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
                                                Already Applied
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleOpenApply(job)}
                                                className="btn-primary seller-edit-btn inline-flex items-center gap-2 justify-center"
                                            >
                                                <Sparkles size={16} />
                                                Apply
                                            </button>
                                        )
                                    ) : (
                                        <a href={`mailto:${job.buyer?.email || ''}?subject=${encodeURIComponent(`UniGig job application: ${job.title}`)}`} className="btn-primary seller-edit-btn inline-flex items-center gap-2 justify-center">
                                            <Mail size={16} />
                                            Contact Buyer
                                        </a>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {selectedJob ? (
                <div className="seller-modal-overlay seller-order-detail-overlay" onClick={handleCloseApply}>
                    <div className="seller-modal-content seller-order-detail-modal" onClick={(event) => event.stopPropagation()}>
                        <button type="button" onClick={handleCloseApply} className="seller-modal-close">
                            <X size={24} />
                        </button>

                        <form onSubmit={handleSubmitApplication} className="p-8 sm:p-10">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 mb-2">Seller Application</p>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">{selectedJob.title}</h2>
                            <p className="text-sm text-slate-500 mb-8">
                                Send a short proposal to explain why you are a good fit for this buyer request.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div className="rounded-[22px] border border-slate-100 bg-slate-50 p-5">
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Buyer Budget</p>
                                    <p className="text-base font-black text-slate-900">LKR {Number(selectedJob.budget || 0).toLocaleString()}</p>
                                </div>
                                <div className="rounded-[22px] border border-slate-100 bg-slate-50 p-5">
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Requested Delivery</p>
                                    <p className="text-base font-black text-slate-900">{selectedJob.deliveryTime} Days</p>
                                </div>
                            </div>

                            <label className="block mb-5">
                                <span className="block text-sm font-bold text-slate-700 mb-2">Proposal Message</span>
                                <textarea
                                    value={applicationForm.message}
                                    onChange={handleApplicationChange('message')}
                                    rows={5}
                                    placeholder="Introduce yourself, explain your approach, and share why you're a strong fit."
                                    className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
                                />
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <label className="block">
                                    <span className="block text-sm font-bold text-slate-700 mb-2">Proposed Price (LKR)</span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={applicationForm.proposedPrice}
                                        onChange={handleApplicationChange('proposedPrice')}
                                        className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </label>
                                <label className="block">
                                    <span className="block text-sm font-bold text-slate-700 mb-2">Delivery Time (Days)</span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={applicationForm.deliveryTime}
                                        onChange={handleApplicationChange('deliveryTime')}
                                        className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </label>
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                <button type="submit" disabled={submittingApplication} className="btn-primary seller-edit-btn inline-flex items-center justify-center gap-2">
                                    <Sparkles size={16} />
                                    {submittingApplication ? 'Sending Application...' : 'Submit Application'}
                                </button>
                                <button type="button" onClick={handleCloseApply} className="btn-secondary seller-edit-btn inline-flex items-center justify-center gap-2">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </section>
    );
}

export default JobsPage;
