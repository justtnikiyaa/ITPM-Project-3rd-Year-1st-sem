import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import StarRating from './StarRating';
import { Hash, AlertCircle, CheckCircle2 } from 'lucide-react';

function AddReviewForm({ sellerId = '', preselectedOrderId = '', onSuccess }) {
    const [form, setForm] = useState({ orderId: preselectedOrderId, sellerId, rating: 5, comment: '' });
    const [completedOrders, setCompletedOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [mode, setMode] = useState(preselectedOrderId ? 'direct' : 'select');

    useEffect(() => {
        const loadEligibleOrders = async () => {
            setOrdersLoading(true);
            try {
                // Fetch both orders and existing reviews to filter out duplicates
                const [ordersRes, reviewsRes] = await Promise.all([
                    apiClient.get('/api/orders/buyer'),
                    apiClient.get('/api/reviews/me')
                ]);

                const allOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
                const myReviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
                
                // Set of order IDs that already have reviews
                const reviewedOrderIds = new Set(myReviews.map(r => String(r.order)));
                
                const eligible = allOrders.filter((order) => {
                    // Must be completed AND not already reviewed
                    if (order.status !== 'Completed' || reviewedOrderIds.has(String(order._id))) {
                        return false;
                    }
                    
                    if (sellerId) {
                        const orderSellerId = order?.seller?._id || order?.seller;
                        return String(orderSellerId) === String(sellerId);
                    }
                    return true;
                });

                setCompletedOrders(eligible);
                
                if (!preselectedOrderId && eligible.length > 0 && mode === 'select') {
                    setForm(prev => ({ ...prev, orderId: eligible[0]._id }));
                } else if (!preselectedOrderId && eligible.length === 0) {
                    setForm(prev => ({ ...prev, orderId: '' }));
                }
            } catch (err) {
                console.error('Failed to load data for review form', err);
                setCompletedOrders([]);
            } finally {
                setOrdersLoading(false);
            }
        };

        loadEligibleOrders();
    }, [sellerId, preselectedOrderId]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const orderIdToSubmit = form.orderId.trim();

        if (!orderIdToSubmit || !form.comment.trim()) {
            setError('Order ID and Comment are required.');
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/api/reviews', {
                ...form,
                orderId: orderIdToSubmit
            });
            setMessage('Review submitted successfully!');
            setForm({ orderId: preselectedOrderId || '', sellerId, rating: 5, comment: '' });
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review. Ensure the Order ID is valid and completed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="glass-card p-6 space-y-6 animate-fade-in shadow-xl border-none">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-[#1a1a2e]">Submit Review</h3>
                <div className="p-2 bg-[#f0f0ff] text-[#4a3fb9] rounded-lg">
                    <Hash size={20} />
                </div>
            </div>

            <div className="space-y-4">
                {preselectedOrderId ? (
                    <div className="bg-[#f6f4ff] border border-[#dedbff] p-4 rounded-2xl">
                        <p className="text-[10px] font-black uppercase text-[#4a3fb9] mb-1">Reviewing Order</p>
                        <p className="text-sm font-bold text-[#1a1a2e] font-mono">{preselectedOrderId}</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Order Reference</label>
                            <button 
                                type="button" 
                                onClick={() => setMode(mode === 'select' ? 'manual' : 'select')}
                                className="text-[10px] font-black text-[#4a3fb9] hover:underline"
                            >
                                {mode === 'select' ? 'Enter ID Manually' : 'Select from List'}
                            </button>
                        </div>

                        {mode === 'select' ? (
                            <select
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4a3fb9] transition-all"
                                value={form.orderId}
                                onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                                disabled={ordersLoading || !completedOrders.length}
                            >
                                {ordersLoading ? <option>Loading your orders...</option> : null}
                                {!ordersLoading && !completedOrders.length ? (
                                    <option value="">No completed orders found</option>
                                ) : null}
                                {completedOrders.map((order) => (
                                    <option key={order._id} value={order._id}>
                                        {order.titleSnapshot || order.service?.title || 'Order'} ({new Date(order.createdAt).toLocaleDateString()})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input 
                                type="text"
                                placeholder="Paste Order ID here..."
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4a3fb9] transition-all font-mono"
                                value={form.orderId}
                                onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                            />
                        )}
                    </div>
                )}

                <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block px-1">Rating</label>
                    <div className="bg-[#fafaff] border border-[#ececff] p-4 rounded-2xl flex justify-center">
                        <StarRating rating={form.rating} setRating={(val) => setForm({ ...form, rating: val })} size={32} />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block px-1">Your Feedback</label>
                    <textarea 
                        placeholder="What was your experience with this student seller?" 
                        className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4a3fb9] transition-all min-h-[120px]"
                        value={form.comment} 
                        onChange={(e) => setForm({ ...form, comment: e.target.value })} 
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-xl flex items-start gap-3 border border-red-100 animate-fade-in">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p className="text-xs font-bold leading-relaxed">{error}</p>
                </div>
            )}

            {message && (
                <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-start gap-3 border border-green-100 animate-fade-in">
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                    <p className="text-xs font-bold leading-relaxed">{message}</p>
                </div>
            )}

            <button 
                type="submit" 
                className="w-full py-4 bg-[#4a3fb9] text-white font-black rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 flex items-center justify-center gap-2" 
                disabled={loading || !form.orderId}
            >
                {loading ? 'Submitting Review...' : 'Submit Final Review'}
            </button>
        </form>
    );
}

export default AddReviewForm;
