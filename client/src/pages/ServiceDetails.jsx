import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Clock,
    Tag,
    User,
    Shield,
    Zap,
    ArrowLeft,
    MessageCircle,
    ShoppingCart,
    Star,
    Calendar,
    ChevronRight,
    MapPin
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ServiceDetails = () => {
    const { id } = useParams();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const res = await axios.get(`/api/services/${id}`);
                setService(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Fetch service error:', err);
                setError(err.response?.data?.message || 'Failed to load service');
                setLoading(false);
            }
        };
        fetchService();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div className="home-page-light min-h-screen pt-32 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 animate-pulse">Loading perfection...</p>
                </div>
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="home-page-light min-h-screen pt-32 flex items-center justify-center">
                <div className="text-center p-8 glass-card max-w-md mx-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Service not found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The service you are looking for might have been removed.'}</p>
                    <Link to="/" className="btn-primary inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Discover
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="home-page-light min-h-screen pt-28 pb-20">
            {/* Background Glows */}
            <div className="glow-orb glow-orb--purple" style={{ top: '5%', left: '-5%', opacity: 0.15 }}></div>
            <div className="glow-orb glow-orb--teal" style={{ bottom: '5%', right: '-5%', opacity: 0.15 }}></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-10 animate-fade-in-up">
                    <Link to="/" className="hover:text-[var(--color-primary)] transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                    <span className="text-gray-400 capitalize">{service.category}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                    <span className="text-gray-900 font-bold truncate max-w-[250px]">{service.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Image and Description */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Main Image Card */}
                        <div className="glass-card overflow-hidden rounded-[2.5rem] animate-fade-in-up shadow-2xl shadow-indigo-100/20" style={{ animationDelay: '0.1s' }}>
                            <div className="aspect-[16/10] relative overflow-hidden bg-gray-50">
                                {service.coverImage ? (
                                    <img
                                        src={`${API_BASE}${service.coverImage}`}
                                        alt={service.title}
                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-emerald-50 text-gray-400">
                                        <Tag className="w-20 h-20 opacity-20" />
                                    </div>
                                )}
                                <div className="absolute top-8 left-8">
                                    <span className="px-5 py-2 bg-white/95 backdrop-blur-md rounded-full text-xs font-black text-[var(--color-primary)] shadow-xl border border-white/50 tracking-wider">
                                        {service.category.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Gig Description */}
                        <div className="glass-card p-10 sm:p-14 rounded-[2.5rem] animate-fade-in-up shadow-xl shadow-indigo-100/10" style={{ animationDelay: '0.2s' }}>
                            <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-4">
                                <span className="w-2 h-10 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-accent)] rounded-full"></span>
                                About this Service
                            </h2>
                            <div className="prose prose-lg prose-indigo max-w-none text-gray-700 leading-relaxed font-medium">
                                {service.description.split('\n').map((para, i) => (
                                    <p key={i} className="mb-4">{para}</p>
                                ))}
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12 pt-12 border-t border-gray-100">
                                <div className="flex items-start gap-5 group">
                                    <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                                        <Shield className="w-7 h-7 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 text-lg">Verified Student</h4>
                                        <p className="text-gray-500 leading-snug">Hand-vetted student freelancer from SL SL university.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-5 group">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                                        <Zap className="w-7 h-7 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 text-lg">Student Pricing</h4>
                                        <p className="text-gray-500 leading-snug">Quality work at rates that respect a student budget.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Pricing and Seller */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-28 space-y-10">
                            {/* Order Card */}
                            <div className="glass-card p-10 rounded-[2.5rem] animate-fade-in-up shadow-2xl shadow-indigo-100/30" style={{ animationDelay: '0.3s' }}>
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-4xl font-black text-gray-900 tracking-tight">
                                            LKR {service.price.toLocaleString()}
                                        </h3>
                                        <p className="text-sm text-indigo-500 font-black uppercase tracking-widest mt-1">Starting Price</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1.5 text-amber-500 font-black bg-amber-50 px-4 py-1.5 rounded-full text-sm shadow-sm">
                                            <Star className="w-4 h-4 fill-current" />
                                            4.9
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">12 Orders done</span>
                                    </div>
                                </div>

                                <div className="space-y-6 mb-10 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                    <div className="flex items-center gap-4 text-gray-700">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Delivery Time</p>
                                            <p className="text-sm font-bold text-gray-900">{service.deliveryTime}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-gray-700">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Revisions</p>
                                            <p className="text-sm font-bold text-gray-900">Unlimited Revisions</p>
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full btn-primary py-5 rounded-[1.5rem] flex items-center justify-center gap-3 group text-xl mb-5 shadow-xl shadow-indigo-200">
                                    <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    Order Now
                                </button>

                                <button className="w-full py-5 rounded-[1.5rem] border-2 border-indigo-50 text-indigo-600 font-black hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-3">
                                    <MessageCircle className="w-6 h-6" />
                                    Contact Seller
                                </button>

                                <p className="text-center text-xs text-gray-400 mt-8 font-medium">
                                    Secure checkout by UniGig Pay.
                                </p>
                            </div>

                            {/* Seller Card */}
                            <div className="glass-card p-10 rounded-[2.5rem] animate-fade-in-up border-indigo-50 shadow-xl shadow-indigo-100/10" style={{ animationDelay: '0.4s' }}>
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-indigo-200 overflow-hidden text-center">
                                        {service.seller?.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Freelancer</p>
                                        <h3 className="text-2xl font-black text-gray-900 leading-tight">{service.seller?.name}</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${service.seller?.availability === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
                                            <span className="text-xs font-black text-gray-900 uppercase tracking-tighter italic">{service.seller?.availability} Today</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="flex items-start gap-4">
                                        <MapPin className="w-5 h-5 text-indigo-500 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Education</p>
                                            <p className="text-sm font-bold text-gray-900 truncate">{service.seller?.universityDomain || 'University Student'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <User className="w-5 h-5 text-indigo-500 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Member Since</p>
                                            <p className="text-sm font-bold text-gray-900">February 2024</p>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    to={`/profile/${service.seller?._id}`}
                                    className="w-full mt-10 py-4 rounded-2xl bg-gray-50 flex items-center justify-center text-indigo-600 font-black text-sm hover:bg-gray-100 transition-all border border-gray-100"
                                >
                                    View Seller Portfolio
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetails;
