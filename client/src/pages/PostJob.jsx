import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, ChevronRight, FolderKanban, Sparkles } from 'lucide-react';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

const JOB_CATEGORIES = [
    'Graphic Design',
    'Web Development',
    'Content Writing',
    'Mobile App Development',
    'Video Editing',
    'AI & Machine Learning',
    'Marketing',
    'UI/UX Design',
];

const parseSkillInput = (value) =>
    value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

function PostJob() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: JOB_CATEGORIES[0],
        skills: '',
        budget: '',
        deliveryTime: '',
        requirements: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const validationError = useMemo(() => {
        if (!form.title.trim()) return 'Job title is required.';
        if (!form.description.trim()) return 'Job description is required.';
        if (!form.category.trim()) return 'Please choose a category.';
        if (!Number.isFinite(Number(form.budget)) || Number(form.budget) <= 0) return 'Budget must be a positive number.';
        if (!Number.isFinite(Number(form.deliveryTime)) || Number(form.deliveryTime) <= 0) return 'Delivery time must be at least 1 day.';
        return '';
    }, [form]);

    if (!user) return null;

    if (user.isStudentSeller) {
        return (
            <section className="home-page-light min-h-screen pt-28 pb-20">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="glass-card rounded-[32px] p-10 text-center">
                        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                            <Briefcase />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-4">Only buyers can post jobs</h1>
                        <p className="text-slate-500 leading-7 mb-8">
                            Student sellers can browse open job requests and contact buyers, but job posting is reserved for buyer accounts.
                        </p>
                        <Link to="/jobs" className="btn-primary seller-edit-btn inline-flex items-center gap-2">
                            <FolderKanban size={16} />
                            Browse Open Jobs
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    const handleChange = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            await apiClient.post('/api/jobs', {
                ...form,
                budget: Number(form.budget),
                deliveryTime: Number(form.deliveryTime),
                skills: parseSkillInput(form.skills),
            });
            navigate('/profile/me', {
                state: { jobSuccessMessage: 'Job posted successfully. Freelancers can now see it in the open jobs list.' },
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post job. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="home-page-light min-h-screen pt-24 pb-20">
            <div className="max-w-5xl mx-auto px-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-6 mt-4">
                    <Link to="/" className="hover:text-gray-600 transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                    <Link to="/profile/me" className="hover:text-gray-600 transition-colors">My Profile</Link>
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                    <span className="text-gray-800 font-bold">Post a Job</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.72fr] gap-8">
                    <form onSubmit={handleSubmit} className="glass-card rounded-[32px] p-8 sm:p-10 shadow-[0_22px_50px_rgba(80,70,170,0.10)]">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-[22px] bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <FolderKanban />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-400 mb-1">Buyer Request</p>
                                <h1 className="text-3xl font-black text-slate-900">Post a New Job</h1>
                                <p className="text-sm text-slate-500 mt-2">
                                    Describe what you need and UniGig sellers can reach out with the right skills.
                                </p>
                            </div>
                        </div>

                        {error ? (
                            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
                                {error}
                            </div>
                        ) : null}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <label className="block md:col-span-2">
                                <span className="block text-sm font-bold text-slate-700 mb-2">Job Title</span>
                                <input type="text" value={form.title} onChange={handleChange('title')} placeholder="I need a graphic designer for social media posts" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                            </label>

                            <label className="block md:col-span-2">
                                <span className="block text-sm font-bold text-slate-700 mb-2">Description</span>
                                <textarea value={form.description} onChange={handleChange('description')} rows={6} placeholder="Share your goals, style, platform, and what the freelancer should deliver." className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none" />
                            </label>

                            <label className="block">
                                <span className="block text-sm font-bold text-slate-700 mb-2">Category</span>
                                <select value={form.category} onChange={handleChange('category')} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                                    {JOB_CATEGORIES.map((category) => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="block">
                                <span className="block text-sm font-bold text-slate-700 mb-2">Skills / Tags</span>
                                <input type="text" value={form.skills} onChange={handleChange('skills')} placeholder="design, instagram, branding" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                            </label>

                            <label className="block">
                                <span className="block text-sm font-bold text-slate-700 mb-2">Budget (LKR)</span>
                                <input type="number" min="1" value={form.budget} onChange={handleChange('budget')} placeholder="5000" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                            </label>

                            <label className="block">
                                <span className="block text-sm font-bold text-slate-700 mb-2">Delivery Time (Days)</span>
                                <input type="number" min="1" value={form.deliveryTime} onChange={handleChange('deliveryTime')} placeholder="7" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                            </label>

                            <label className="block md:col-span-2">
                                <span className="block text-sm font-bold text-slate-700 mb-2">Additional Requirements</span>
                                <textarea value={form.requirements} onChange={handleChange('requirements')} rows={4} placeholder="Optional references, file formats, brand colors, links, or notes." className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none" />
                            </label>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <button type="submit" disabled={submitting} className="btn-primary seller-edit-btn inline-flex items-center justify-center gap-2">
                                <Sparkles size={16} />
                                {submitting ? 'Posting Job...' : 'Post Job'}
                            </button>
                            <Link to="/profile/me" className="btn-secondary seller-edit-btn inline-flex items-center justify-center gap-2">
                                Cancel
                            </Link>
                        </div>
                    </form>

                    <aside className="glass-card rounded-[32px] p-8 shadow-[0_18px_40px_rgba(80,70,170,0.08)] h-fit">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-400 mb-3">Helpful Tips</p>
                        <h2 className="text-2xl font-black text-slate-900 mb-4">Get better freelancer responses</h2>
                        <div className="space-y-4 text-sm text-slate-600 leading-7">
                            <p>Use a specific title so sellers can quickly understand the work.</p>
                            <p>Include your budget and deadline up front to attract the right candidates.</p>
                            <p>Add a few skills or tools so the job appears more relevant in the open jobs feed.</p>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}

export default PostJob;
