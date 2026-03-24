function RatingSummary({ stats }) {
    return (
        <div className="portfolio-rating-card">
            <h3>Rating Summary</h3>
            <p className="stat-main">{stats.averageRating.toFixed(1)} / 5</p>
            <div className="portfolio-stats-grid">
                <div><strong>{stats.totalRatings}</strong><span>Total Ratings</span></div>
                <div><strong>{stats.totalReviews}</strong><span>Total Reviews</span></div>
                <div><strong>{stats.totalCompletedProjects}</strong><span>Completed Projects</span></div>
            </div>
        </div>
    );
}

export default RatingSummary;
