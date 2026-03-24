function ReviewsList({ reviews, loading }) {
    if (loading) return <p className="portfolio-muted">Loading reviews...</p>;
    if (!reviews.length) return <p className="portfolio-muted">No reviews yet.</p>;

    return (
        <div className="portfolio-list">
            {reviews.map((review) => (
                <article key={review._id} className="portfolio-review-card">
                    <div className="portfolio-review-head">
                        <h4 className="portfolio-card-title">{review.reviewerName}</h4>
                        <span className="portfolio-rating-badge">{review.rating}/5</span>
                    </div>
                    <p className="portfolio-card-text">{review.comment}</p>
                    <small className="portfolio-card-meta">{new Date(review.createdAt).toLocaleDateString()}</small>
                </article>
            ))}
        </div>
    );
}

export default ReviewsList;
