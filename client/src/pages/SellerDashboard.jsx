import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CreateGigForm from '../components/CreateGigForm';
import {
    Activity,
    AlertCircle,
    ClipboardList,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    Eye,
    Plus,
    Edit3,
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

const formatDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const getDeliveryDeadline = (order) => {
    const baseDate = order?.orderDate || order?.createdAt;
    const deliveryDays = Number(order?.deliveryDays || 0);
    if (!baseDate || !deliveryDays) return 'N/A';

    const deadline = new Date(baseDate);
    deadline.setDate(deadline.getDate() + deliveryDays);
    return formatDate(deadline);
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
    const [incomingOrders, setIncomingOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [updatingOrderId, setUpdatingOrderId] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
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

    const fetchIncomingOrders = useCallback(async () => {
        try {
            setOrdersLoading(true);
            const res = await axios.get('/api/orders/seller');
            setIncomingOrders(res.data);
        } catch (err) {
            console.error('Failed to load incoming orders:', err);
            setError(err.response?.data?.message || 'Failed to load incoming orders.');
        } finally {
            setOrdersLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.isStudentSeller) {
            fetchIncomingOrders();
        }
    }, [user, fetchIncomingOrders]);

    // Hide the navbar while the create gig modal is open to maximize viewport space.
    useEffect(() => {
        if (showForm || selectedOrder) {
            document.body.classList.add('seller-modal-open');
        } else {
            document.body.classList.remove('seller-modal-open');
        }

        return () => {
            document.body.classList.remove('seller-modal-open');
        };
    }, [showForm, selectedOrder]);

    // ✅ SELLER ACTIVE/NON-ACTIVE STATUS - TOGGLE HANDLER
    const handleToggleAvailability = async () => {
        setToggling(true);
        try {
            // Call backend endpoint to toggle availability between 'Active' and 'Away'
            const res = await axios.patch('/api/users/availability');
            // Update user context with new availability status
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

    const handleUpdateOrderStatus = async (orderId, status) => {
        try {
            setUpdatingOrderId(orderId);
            const res = await axios.patch(`/api/orders/${orderId}/status`, { status });
            setIncomingOrders((prev) =>
                prev.map((order) => (order._id === orderId ? res.data.order : order))
            );
            setSuccess('Order status updated successfully.');
            setTimeout(() => setSuccess(''), 2500);
            fetchEarnings();
        } catch (err) {
            console.error('Failed to update order status:', err);
            setError(err.response?.data?.message || 'Failed to update order status.');
        } finally {
            setUpdatingOrderId('');
        }
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingGig(null);
    };

    if (!user?.isStudentSeller) return null;

    const isActive = user?.availability === 'Active';
    const statusClasses = {
        Pending: 'bg-amber-50 text-amber-700 border-amber-200',
        'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
        Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    const recentActivity = useMemo(() => {
        const orderActivities = incomingOrders.flatMap((order) => {
            const items = [
                {
                    id: `order-${order._id}`,
                    type: 'new-order',
                    title: 'New order received',
                    description: `${order.buyer?.name || 'A buyer'} ordered ${order.titleSnapshot || order.service?.title || 'your gig'}.`,
                    date: order.createdAt || order.orderDate,
                    icon: AlertCircle,
                    tone: 'bg-amber-50 text-amber-700 border-amber-200',
                },
            ];

            if (order.status === 'Completed' && order.completedAt) {
                items.push({
                    id: `completed-${order._id}`,
                    type: 'completed-order',
                    title: 'Order marked completed',
                    description: `${order.titleSnapshot || order.service?.title || 'An order'} was completed successfully.`,
                    date: order.completedAt,
                    icon: CheckCircle2,
                    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                });
            }

            return items;
        });

        const gigActivities = gigs
            .filter((gig) => gig.updatedAt && gig.createdAt && gig.updatedAt !== gig.createdAt)
            .map((gig) => ({
                id: `gig-${gig._id}`,
                type: 'gig-updated',
                title: 'Gig updated',
                description: `${gig.title} was updated in your seller profile.`,
                date: gig.updatedAt,
                icon: Sparkles,
                tone: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            }));

        return [...orderActivities, ...gigActivities]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 6);
    }, [incomingOrders, gigs]);

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

                <section className="animate-fade-in-up mb-10">
                    <div className="seller-dash-light__grid-header">
                        <h2 className="seller-dash-light__section-title">
                            Recent <span className="gradient-text">Activity</span>
                        </h2>
                        <span className="text-sm font-medium opacity-60">
                            Latest actions across gigs and orders
                        </span>
                    </div>

                    {recentActivity.length === 0 ? (
                        <div className="glass-card p-8 rounded-[24px] text-center">
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                                <Activity />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No recent activity yet</h3>
                            <p className="text-sm text-gray-500">
                                New orders, gig edits, and completed work will show up here.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {recentActivity.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <article
                                        key={item.id}
                                        className="rounded-[22px] border border-white/70 bg-white/90 p-5 shadow-[0_12px_28px_rgba(80,70,170,0.08)]"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${item.tone}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-gray-900">{item.title}</p>
                                                <p className="text-sm text-gray-600 leading-6 mt-1">{item.description}</p>
                                                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mt-3">
                                                    {formatDate(item.date)}
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

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

                <section className="animate-fade-in-up">
                    <div className="seller-dash-light__grid-header">
                        <h2 className="seller-dash-light__section-title">
                            Incoming <span className="gradient-text">Orders</span>
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium opacity-60">
                                {incomingOrders.length} {incomingOrders.length === 1 ? 'order' : 'orders'}
                            </span>
                            <button
                                onClick={fetchIncomingOrders}
                                disabled={ordersLoading}
                                className="p-2 rounded-full hover:bg-black/5 transition-colors"
                                title="Reload orders"
                            >
                                <Sparkles className={ordersLoading ? 'animate-spin' : ''} size={18} />
                            </button>
                        </div>
                    </div>

                    {ordersLoading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
                            {[1, 2].map((item) => (
                                <div key={item} className="seller-dash-light__skeleton seller-dash-light__skeleton-shimmer" style={{ height: '200px' }} />
                            ))}
                        </div>
                    ) : incomingOrders.length === 0 ? (
                        <div className="glass-card p-10 rounded-[28px] text-center mb-10">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                                <ClipboardList />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No incoming orders yet</h3>
                            <p className="text-sm text-gray-500">
                                New buyer orders for your gigs will appear here as soon as they are placed.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
                            {incomingOrders.map((order) => (
                                <article
                                    key={order._id}
                                    className="rounded-[28px] border border-white/60 bg-white/85 backdrop-blur p-6 shadow-[0_14px_35px_rgba(80,70,170,0.08)]"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-5">
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400 mb-2">
                                                Order ID
                                            </p>
                                            <h3 className="text-lg font-black text-gray-900 break-all">{order._id}</h3>
                                        </div>
                                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wide ${statusClasses[order.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="space-y-3 text-sm text-gray-700">
                                        <div className="flex items-start gap-3">
                                            <ClipboardList className="w-4 h-4 mt-0.5 text-indigo-500" />
                                            <div>
                                                <p className="font-semibold text-gray-500">Gig Title</p>
                                                <p className="font-bold text-gray-900">{order.titleSnapshot || order.service?.title}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Sparkles className="w-4 h-4 mt-0.5 text-indigo-500" />
                                            <div>
                                                <p className="font-semibold text-gray-500">Buyer</p>
                                                <p className="font-bold text-gray-900">{order.buyer?.name || 'Unknown buyer'}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
                                                <p className="text-xs font-bold text-slate-400 mb-1">Price</p>
                                                <p className="font-black text-slate-900 inline-flex items-center gap-1">
                                                    <CircleDollarSign className="w-4 h-4 text-indigo-500" />
                                                    LKR {Number(order.price || 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
                                                <p className="text-xs font-bold text-slate-400 mb-1">Delivery</p>
                                                <p className="font-black text-slate-900">{order.deliveryTime}</p>
                                            </div>
                                            <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
                                                <p className="text-xs font-bold text-slate-400 mb-1">Created</p>
                                                <p className="font-black text-slate-900 inline-flex items-center gap-1">
                                                    <CalendarDays className="w-4 h-4 text-indigo-500" />
                                                    {new Date(order.createdAt || order.orderDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="rounded-2xl bg-indigo-50/60 p-4 border border-indigo-100">
                                            <p className="text-xs font-bold uppercase tracking-wide text-indigo-400 mb-2">Buyer Requirements</p>
                                            <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">
                                                {order.requirementsMessage || 'No buyer instructions were provided.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">
                                                Update Status
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Keep the buyer informed as you work through this order.
                                            </p>
                                        </div>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                            disabled={updatingOrderId === order._id}
                                            className="min-w-[170px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                                        >
                                            {['Pending', 'In Progress', 'Completed', 'Cancelled'].map((status) => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedOrder(order)}
                                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Order Details
                                    </button>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

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

                {selectedOrder && (
                    <div className="seller-modal-overlay seller-order-detail-overlay" onClick={() => setSelectedOrder(null)}>
                        <div
                            className="seller-modal-content seller-order-detail-modal"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => setSelectedOrder(null)}
                                className="seller-modal-close"
                            >
                                <X size={24} />
                            </button>

                            <div className="p-8 sm:p-10">
                                <div className="flex items-start justify-between gap-4 mb-8">
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400 mb-2">
                                            Order Detail View
                                        </p>
                                        <h2 className="text-2xl font-black text-gray-900 leading-tight">
                                            {selectedOrder.titleSnapshot || selectedOrder.service?.title}
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-2 break-all">
                                            Order ID: {selectedOrder._id}
                                        </p>
                                    </div>
                                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wide ${statusClasses[selectedOrder.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="rounded-[22px] border border-slate-100 bg-slate-50 p-5">
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Buyer</p>
                                        <p className="text-base font-black text-slate-900">{selectedOrder.buyer?.name || 'Unknown buyer'}</p>
                                        <p className="text-sm text-slate-500 mt-1">{selectedOrder.buyer?.email || 'No email available'}</p>
                                    </div>
                                    <div className="rounded-[22px] border border-slate-100 bg-slate-50 p-5">
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Selected Package</p>
                                        <p className="text-base font-black text-slate-900">{selectedOrder.packageName || 'Standard'}</p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            LKR {Number(selectedOrder.price || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                    <div className="rounded-[22px] border border-indigo-100 bg-indigo-50/60 p-5">
                                        <p className="text-xs font-bold uppercase tracking-wide text-indigo-400 mb-2">Order Date</p>
                                        <p className="text-base font-black text-slate-900">{formatDate(selectedOrder.orderDate || selectedOrder.createdAt)}</p>
                                    </div>
                                    <div className="rounded-[22px] border border-emerald-100 bg-emerald-50/60 p-5">
                                        <p className="text-xs font-bold uppercase tracking-wide text-emerald-500 mb-2">Delivery Time</p>
                                        <p className="text-base font-black text-slate-900">{selectedOrder.deliveryTime}</p>
                                    </div>
                                    <div className="rounded-[22px] border border-amber-100 bg-amber-50/60 p-5">
                                        <p className="text-xs font-bold uppercase tracking-wide text-amber-500 mb-2">Delivery Deadline</p>
                                        <p className="text-base font-black text-slate-900">{getDeliveryDeadline(selectedOrder)}</p>
                                    </div>
                                </div>

                                <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400 mb-3">
                                        Buyer Requirements
                                    </p>
                                    <p className="text-sm leading-7 text-slate-700 whitespace-pre-wrap">
                                        {selectedOrder.requirementsMessage || 'No buyer requirements were provided.'}
                                    </p>
                                </div>
                            </div>
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
