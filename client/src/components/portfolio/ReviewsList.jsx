import { useState } from 'react';

function ReviewsList({ reviews, loading, currentUserId, onUpdateReview, onDeleteReview }) {
    const [editingReviewId, setEditingReviewId] = useState('');
    const [editForm, setEditForm] = useState({ rating: 5, comment: '' });
    const [error, setError] = useState('');
    const [busyReviewId, setBusyReviewId] = useState('');

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

    const removeReview = async (reviewId) => {
        setError('');
        try {
            setBusyReviewId(reviewId);
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
        <div className="portfolio-list">
            {error ? <p className="text-error">{error}</p> : null}
            {reviews.map((review) => (
                <article key={review._id} className="portfolio-review-card">
                    <div className="portfolio-review-head">
                        <h4 className="portfolio-card-title">{review.reviewerName}</h4>
                        <span className="portfolio-rating-badge">{review.rating}/5</span>
                    </div>
                    {editingReviewId === review._id ? (
                        <div className="form-stack">
                            <input
                                type="number"
                                min="1"
                                max="5"
                                step="1"
                                value={editForm.rating}
                                onChange={(e) => setEditForm((prev) => ({
                                    ...prev,
                                    rating: Number.parseInt(e.target.value || '0', 10),
                                }))}
                            />
                            <textarea
                                value={editForm.comment}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, comment: e.target.value }))}
                            />
                            <div className="profile-action-row">
                                <button
                                    type="button"
                                    className="btn-primary"
                                    disabled={busyReviewId === review._id}
                                    onClick={() => submitEdit(review._id)}
                                >
                                    {busyReviewId === review._id ? 'Saving...' : 'Save'}
                                </button>
                                <button type="button" className="btn-secondary" onClick={cancelEdit}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="portfolio-card-text">{review.comment}</p>
                    )}
                    <small className="portfolio-card-meta">{new Date(review.createdAt).toLocaleDateString()}</small>
                    {String(review.buyerId) === String(currentUserId) && editingReviewId !== review._id ? (
                        <div className="profile-action-row">
                            <button type="button" className="btn-secondary" onClick={() => startEdit(review)}>
                                Edit
                            </button>
                            <button
                                type="button"
                                className="btn-secondary"
                                disabled={busyReviewId === review._id}
                                onClick={() => removeReview(review._id)}
                            >
                                {busyReviewId === review._id ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    ) : null}
                </article>
            ))}
        </div>
    );
}

export default ReviewsList;
