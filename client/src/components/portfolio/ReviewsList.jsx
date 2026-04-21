import { useState } from 'react';
import StarRating from './StarRating';
import { User, CheckCircle, Edit3, Trash2 } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

function ReviewsList({ reviews, loading, currentUserId, onUpdateReview, onDeleteReview }) {
    const [editingReviewId, setEditingReviewId] = useState('');
    const [editForm, setEditForm] = useState({ rating: 5, comment: '' });
    const [error, setError] = useState('');
    const [busyReviewId, setBusyReviewId] = useState('');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, reviewId: null });

    if (loading) return <p className="portfolio-muted">Loading reviews...</p>;
    if (!reviews.length) return <p className="portfolio-muted">No reviews yet.</p>;

    const startEdit = (review) => {
        setError('');
        setEditingReviewId(review._id);
        setEditForm({
            rating: Number(review.rating) || 5,
            comment: review.comment || '',
        });
    };

    const cancelEdit = () => {
        setEditingReviewId('');
        setError('');
    };

    const submitEdit = async (reviewId) => {
        setError('');
        if (!Number.isInteger(editForm.rating) || editForm.rating < 1 || editForm.rating > 5) {
            setError('Rating must be an integer between 1 and 5.');
            return;
        }
        if (!editForm.comment.trim()) {
            setError('Comment is required.');
            return;
        }

        try {
            setBusyReviewId(reviewId);
            await onUpdateReview(reviewId, {
                rating: editForm.rating,
                comment: editForm.comment.trim(),
            });
            setEditingReviewId('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update review.');
        } finally {
            setBusyReviewId('');
        }
    };

    const handleDelete = async () => {
        const reviewId = confirmModal.reviewId;
        if (!reviewId) return;
        
        setError('');
        try {
            setBusyReviewId(reviewId);
            setConfirmModal({ isOpen: false, reviewId: null });
            await onDeleteReview(reviewId);
            if (editingReviewId === reviewId) {
                setEditingReviewId('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete review.');
        } finally {
            setBusyReviewId('');
        }
    };

    return (
        <>
            <div className="portfolio-list">
                {error ? <p className="text-error">{error}</p> : null}
                {reviews.map((review, idx) => (
                    <article key={review._id} className="glass-card p-6 mb-6 animate-fade-in border-none shadow-sm hover:shadow-md transition-shadow" style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-[#1a1a2e] flex items-center gap-2">
                                        {review.reviewerName}
                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-[#e5fcf4] text-[#00b88a] text-[10px] font-black uppercase rounded-full">
                                            <CheckCircle size={10} /> Buyer
                                        </span>
                                    </h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>
                            <StarRating rating={review.rating} readOnly size={14} />
                        </div>
                        {editingReviewId === review._id ? (
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <div style={{ marginBottom: '16px' }}>
                                    <StarRating rating={editForm.rating} setRating={(val) => setEditForm({ ...editForm, rating: val })} size={24} />
                                </div>
                                <textarea
                                    className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4a3fb9] transition-all"
                                    value={editForm.comment}
                                    onChange={(e) => setEditForm((prev) => ({ ...prev, comment: e.target.value }))}
                                    rows={3}
                                />
                                <div className="flex gap-3 mt-4">
                                    <button
                                        type="button"
                                        className="px-6 py-2 bg-[#4a3fb9] text-white text-xs font-black rounded-lg hover:shadow-lg transition-all"
                                        disabled={busyReviewId === review._id}
                                        onClick={() => submitEdit(review._id)}
                                    >
                                        {busyReviewId === review._id ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button type="button" className="px-6 py-2 bg-gray-200 text-gray-600 text-xs font-black rounded-lg hover:bg-gray-300 transition-colors" onClick={cancelEdit}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600 font-medium leading-relaxed bg-[#fafaff] p-4 rounded-2xl border border-[#ececff]">{review.comment}</p>
                        )}
                        
                        {String(review.buyerId) === String(currentUserId) && editingReviewId !== review._id ? (
                            <div className="flex gap-3 mt-4 justify-end">
                                <button type="button" className="text-[10px] font-black uppercase tracking-widest text-[#4a3fb9] hover:underline" onClick={() => startEdit(review)}>
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline"
                                    disabled={busyReviewId === review._id}
                                    onClick={() => setConfirmModal({ isOpen: true, reviewId: review._id })}
                                >
                                    {busyReviewId === review._id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        ) : null}
                    </article>
                ))}
            </div>

            <ConfirmationModal 
                isOpen={confirmModal.isOpen}
                title="Remove Feedback?"
                message="Are you sure you want to delete this review? This action is permanent and will remove the rating from the seller's total score."
                confirmText="Delete Review"
                cancelText="Keep Review"
                onConfirm={handleDelete}
                onCancel={() => setConfirmModal({ isOpen: false, reviewId: null })}
            />
        </>
    );
}

export default ReviewsList;
