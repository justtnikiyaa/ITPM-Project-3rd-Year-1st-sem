import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';

function AddReviewForm({ sellerId = '', onSuccess }) {
    const [form, setForm] = useState({ orderId: '', sellerId, rating: 5, comment: '' });
    const [completedOrders, setCompletedOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const loadEligibleOrders = async () => {
            setOrdersLoading(true);
            try {
                const { data } = await apiClient.get('/api/orders/buyer');
                const eligible = (Array.isArray(data) ? data : []).filter((order) => {
                    const orderSellerId = order?.seller?._id || order?.seller;
                    return order.status === 'Completed' && String(orderSellerId) === String(sellerId);
                });

                setCompletedOrders(eligible);
                setForm((prev) => ({
                    ...prev,
                    sellerId,
                    orderId: eligible[0]?._id || '',
                }));
            } catch {
                setCompletedOrders([]);
            } finally {
                setOrdersLoading(false);
            }
        };

        if (sellerId) {
            loadEligibleOrders();
        }
    }, [sellerId]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!form.orderId || !form.comment.trim()) {
            setError('All fields are required.');
            return;
        }
        if (!Number.isInteger(form.rating) || form.rating < 1 || form.rating > 5) {
            setError('Rating must be an integer between 1 and 5.');
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/api/reviews', form);
            setMessage('Review submitted successfully.');
            setForm((prev) => ({ ...prev, rating: 5, comment: '' }));
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="portfolio-card form-stack">
            <h3>Add Review</h3>
            <label>Select Completed Order</label>
            <select
                className="profile-input"
                value={form.orderId}
                onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                disabled={ordersLoading || !completedOrders.length}
            >
                {ordersLoading ? <option>Loading completed orders...</option> : null}
                {!ordersLoading && !completedOrders.length ? (
                    <option value="">No completed orders found for this seller</option>
                ) : null}
                {completedOrders.map((order) => (
                    <option key={order._id} value={order._id}>
                        {order.titleSnapshot || order.service?.title || 'Order'} - {new Date(order.createdAt).toLocaleDateString()}
                    </option>
                ))}
            </select>
            <input
                type="number"
                min="1"
                max="5"
                step="1"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number.parseInt(e.target.value || '0', 10) })}
            />
            <textarea placeholder="Write your review..." value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
            {error ? <p className="text-error">{error}</p> : null}
            {message ? <p className="text-success">{message}</p> : null}
            <button type="submit" className="btn-primary" disabled={loading || !form.orderId}>
                {loading ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
}

export default AddReviewForm;
