import { useState } from 'react';
import apiClient from '../../api/apiClient';

function AddReviewForm({ sellerId = '', onSuccess }) {
    const [form, setForm] = useState({ orderId: '', sellerId, rating: 5, comment: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!form.orderId || !form.comment.trim()) {
            setError('All fields are required.');
            return;
        }
        if (!/^\d+$/.test(String(form.orderId).trim())) {
            setError('Order ID must be numeric for demo submission.');
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
            <input
                placeholder="Order ID (numbers only)"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.orderId}
                onChange={(e) => setForm({ ...form, orderId: e.target.value.replace(/\D/g, '') })}
            />
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
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Submitting...' : 'Submit Review'}</button>
        </form>
    );
}

export default AddReviewForm;
